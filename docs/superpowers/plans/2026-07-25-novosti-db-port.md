# Novosti + Articles (DB-backed) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:dispatching-parallel-agents to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Port the 4 articles and the «Новости» page into `vrum-next`, driven by a Postgres `Post` table, with article bodies stored as typed JSON blocks and server-side `?page=N` pagination.

**Architecture:** Single `Post` model (kind = article | news) in Prisma. Article/news body is a typed `Block[]` (JSON), rendered by a type-safe `PostBody` renderer (no `dangerouslySetInnerHTML`). Feed at `/novosti` (server component, skip/take pagination); detail at `/novosti/[slug]` with per-post metadata + Article JSON-LD. 10 posts loaded via `prisma/seed.ts`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Prisma + Postgres, tsx (seed runner).

## Global Constraints

- Next.js 16 App Router, TypeScript strict; build must pass `tsc --noEmit`, `npm run lint`, `npm run build`.
- Prisma datasource = Postgres via `env("DATABASE_URL")`; local DB via `docker compose up -d db`.
- Russian UI copy verbatim from originals; brand palette tokens only (`--blue`, `--green`, `--amber`, `--ink*`, `--line*`, `--surface*`), no new accent hues.
- No `dangerouslySetInnerHTML` for post bodies (typed blocks only).
- Article slugs (stable, match original filenames): `kak-proverit-avto-pered-pokupkoy`, `priznaki-skruchennogo-probega`, `voprosy-prodavcu`, `stoimost-vladeniya`.
- Cover images already in `public/img/`: `guide-inspect.jpg`, `guide-odometer.jpg`, `guide-questions.jpg`, `guide-cost.jpg`.
- PER_PAGE = 5.
- Source-of-truth originals (do NOT modify): `/Users/egortyshchuk/bin/{kak-proverit-avto-pered-pokupkoy,priznaki-skruchennogo-probega,voprosy-prodavcu,stoimost-vladeniya,novosti}.html`.

---

### Task 1: Prisma model + block types + data layer + seed wiring

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/blocks.ts`
- Create: `src/lib/posts.ts`
- Modify: `package.json` (add `prisma.seed`; devDep `tsx`)

**Interfaces:**
- Produces: `PostKind`, `Post` (Prisma). `Block`, `Span` (TS types).
  `listPosts({page,perPage}) → {posts: PostListItem[], total: number, pages: number}`,
  `getPostBySlug(slug) → PostDetail | null`, `getAllSlugs() → string[]`.

- [ ] **Step 1: Extend schema** — add to `prisma/schema.prisma`:

```prisma
enum PostKind {
  article
  news
}

model Post {
  id             String   @id @default(cuid())
  slug           String   @unique
  kind           PostKind
  category       String
  categoryColor  String
  title          String
  excerpt        String
  coverImage     String?
  readingMin     Int?
  feedTag        String
  publishedAt    DateTime
  seoTitle       String
  seoDescription String
  ogImage        String?
  body           Json
  createdAt      DateTime @default(now())

  @@index([publishedAt])
}
```

- [ ] **Step 2: Migrate** — `docker compose up -d db` then `npx prisma migrate dev --name posts`. Expected: migration `*_posts` created and applied; `npx prisma generate` regenerates client.

- [ ] **Step 3: Block types** — create `src/lib/blocks.ts`:

```ts
export type Span = string | { text: string; bold?: boolean; href?: string };

export type Block =
  | { type: "heading"; level: 2 | 3; text: string; anchor: string }
  | { type: "paragraph"; spans: Span[] }
  | { type: "list"; ordered: boolean; items: Span[][] }
  | { type: "callout"; variant: "tip" | "warn"; title?: string; body: Span[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string; caption?: string };

/** Headings, in document order, for building the table of contents. */
export function tocFromBlocks(blocks: Block[]): { text: string; anchor: string }[] {
  return blocks
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading" && b.level === 2)
    .map((h) => ({ text: h.text, anchor: h.anchor }));
}
```

- [ ] **Step 4: Data layer** — create `src/lib/posts.ts`:

```ts
import { prisma } from "@/lib/prisma";
import type { Block } from "@/lib/blocks";

export const PER_PAGE = 5;

export type PostListItem = {
  slug: string; kind: "article" | "news"; category: string; categoryColor: string;
  title: string; excerpt: string; coverImage: string | null;
  readingMin: number | null; feedTag: string; publishedAt: Date;
};

export type PostDetail = PostListItem & {
  seoTitle: string; seoDescription: string; ogImage: string | null; body: Block[];
};

export async function listPosts(page: number, perPage = PER_PAGE) {
  const p = Math.max(1, page || 1);
  const [rows, total] = await Promise.all([
    prisma.post.findMany({ orderBy: { publishedAt: "desc" }, skip: (p - 1) * perPage, take: perPage }),
    prisma.post.count(),
  ]);
  const posts = rows.map(toListItem);
  return { posts, total, pages: Math.max(1, Math.ceil(total / perPage)), page: p };
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const row = await prisma.post.findUnique({ where: { slug } });
  if (!row) return null;
  return { ...toListItem(row), seoTitle: row.seoTitle, seoDescription: row.seoDescription, ogImage: row.ogImage, body: row.body as unknown as Block[] };
}

export async function getAllSlugs(): Promise<string[]> {
  const rows = await prisma.post.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toListItem(row: any): PostListItem {
  return {
    slug: row.slug, kind: row.kind, category: row.category, categoryColor: row.categoryColor,
    title: row.title, excerpt: row.excerpt, coverImage: row.coverImage,
    readingMin: row.readingMin, feedTag: row.feedTag, publishedAt: row.publishedAt,
  };
}
```

- [ ] **Step 5: Seed wiring** — `npm i -D tsx`; add to `package.json`:

```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

- [ ] **Step 6: Verify** — `npx tsc --noEmit` → exit 0 (seed.ts not yet present is fine; blocks/posts compile). Commit is skipped (repo = home dir; no git commits this project).

---

### Task 2: PostBody renderer

**Files:**
- Create: `src/components/post/PostBody.tsx`

**Interfaces:**
- Consumes: `Block`, `Span`, `tocFromBlocks` from `@/lib/blocks`.
- Produces: `default function PostBody({ blocks }: { blocks: Block[] })`.

- [ ] **Step 1: Implement** — server component that maps each block to JSX using Tailwind + brand tokens. Requirements per block:
  - `heading`: `<h2 id={anchor}>` (level 2, `font-display text-[clamp(22px,3vw,30px)] font-bold text-ink mt-10 scroll-mt-[80px]`) / `<h3>` (level 3, `text-[20px] font-bold text-ink mt-7`).
  - `paragraph`: `<p className="mt-4 text-[16.5px] leading-[1.7] text-ink-2">` rendering spans (string → text; `{bold}` → `<b className="font-bold text-ink">`; `{href}` → `<a className="text-blue underline-offset-2 hover:underline">`).
  - `list`: `<ul className="mt-4 ...list-disc">` / `<ol ...list-decimal>`, each item renders spans.
  - `callout`: rounded box, left accent bar; `tip` → green tint/`--green`, `warn` → amber tint/`--amber`; optional bold title + body spans.
  - `table`: `<table>` with header row + rows (for «costs»), bordered, `text-[15px]`.
  - `image`: `<img loading="lazy" className="rounded-[16px]">` + optional `<figcaption>`.
  - Render a TOC (`tocFromBlocks`) as an `.toc` nav BEFORE the first heading only when there are ≥3 h2s (mirrors original). Anchor links `href={"#"+anchor}`.

- [ ] **Step 2: Verify** — `npx tsc --noEmit` exit 0. Temporary smoke: render `<PostBody blocks={[{type:'heading',level:2,text:'X',anchor:'x'},{type:'paragraph',spans:['ok']}]} />` compiles.

---

### Task 3: Feed route `/novosti` + Pager

**Files:**
- Create: `src/app/novosti/page.tsx`
- Create: `src/components/Pager.tsx`

**Interfaces:**
- Consumes: `listPosts`, `PER_PAGE` from `@/lib/posts`.
- Produces: feed page (server component) reading `searchParams.page`; `Pager({page,pages,basePath})`.

- [ ] **Step 1: Pager** — `src/components/Pager.tsx`: renders `‹`, numbered page links, `›` as `<Link href={`?page=${n}`}>`; current page `.on` style (bg-blue text-white), ends disabled (span, opacity .4). Match `.pager` styling (min-w 42px h 42px rounded-12 border, font-extrabold).

- [ ] **Step 2: Feed page** — `/novosti/page.tsx`:
  - `export const metadata` (title «Новости — vrum.by», description).
  - Read `searchParams` (Next 16: `searchParams` is a Promise — `const { page } = await searchParams`).
  - `const { posts, pages, page: cur } = await listPosts(Number(page) || 1)`.
  - `page-head` (h1 «Новости», subtitle), `.news-list` of `NewsCard`s, `<Pager>`.
  - NewsCard (inline or component): `<Link href={`/novosti/${slug}`}>` with thumb (`coverImage` → `<img>`; null → placeholder gradient tile + icon), `.news-cat` (colored by `categoryColor`), `<h3>` title, `.ex` excerpt, `.news-meta` (`🕐 {readingMin} мин` if article + `feedTag`). Match original `.news-item` layout (flex, 240px thumb, responsive stack <720px).

- [ ] **Step 3: Verify** — `npm run build` compiles the route (data may be empty until seed; page must render with zero posts without crashing → show empty state or just empty list + pager pages=1).

---

### Task 4: Detail route `/novosti/[slug]` + SEO

**Files:**
- Create: `src/app/novosti/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPostBySlug`, `getAllSlugs`, `PostBody`.

- [ ] **Step 1: Implement** — dynamic route:
  - `export async function generateStaticParams()` → `(await getAllSlugs()).map(slug => ({ slug }))`.
  - `export async function generateMetadata({ params })` (Next 16: `params` is a Promise → `await params`): from `getPostBySlug`; set `title=seoTitle`, `description=seoDescription`, `alternates.canonical="/novosti/"+slug`, `openGraph`/`twitter` with `ogImage ?? coverImage`.
  - Page: `const post = await getPostBySlug(slug); if (!post) notFound();`
  - Render: back-nav breadcrumb, category label, `<h1>` title, `.art-banner` (`coverImage`), `<PostBody blocks={post.body}>`, end CTA (link `/#notify`), Article JSON-LD `<script type="application/ld+json">` (headline, datePublished=publishedAt, image, publisher vrum.by).

- [ ] **Step 2: Verify** — `npm run build` compiles; `generateStaticParams` tolerates empty DB at build (returns []) — route still valid.

---

### Task 5: Update landing links

**Files:**
- Modify: `src/components/Guides.tsx` (hrefs `*.html` → `/novosti/<slug>`)
- Modify: `src/components/Nav.tsx` (`novosti.html` → `/novosti`)
- Modify: `src/components/Footer.tsx` (`novosti.html` → `/novosti`)

- [ ] **Step 1: Guides hrefs** — map each card href to `/novosti/<slug>` using the stable slugs. Keep everything else unchanged (only href strings).
- [ ] **Step 2: Nav + Footer** — change the «Новости» link `href` from `novosti.html` to `/novosti`. Only the href.
- [ ] **Step 3: Verify** — `npm run build` compiles; grep shows no remaining `*.html` hrefs in these three files.

---

### Task 6 (PARALLEL — the swarm): Article & news seed data

Each of 6a–6d is INDEPENDENT (one article each) → dispatch in parallel. 6e is the news set.

**Files (each agent creates one):**
- `prisma/seed-data/inspect.ts`, `probeg.ts`, `voprosy.ts`, `stoimost.ts`, `news.ts`

**Interface (every seed-data module exports one const):**

```ts
import type { Prisma } from "@prisma/client";
// a full Post upsert payload (body is Block[] cast to Prisma.InputJsonValue)
export const inspectPost: Prisma.PostCreateInput = {
  slug: "kak-proverit-avto-pered-pokupkoy",
  kind: "article",
  category: "Чек-лист",
  categoryColor: "var(--blue)",
  title: "Как проверить авто перед покупкой",
  excerpt: "<из ленты оригинала>",
  coverImage: "/img/guide-inspect.jpg",
  readingMin: 7,
  feedTag: "Гайд",
  publishedAt: new Date("2026-05-01"),
  seoTitle: "Как проверить авто перед покупкой: чек-лист 2026 — vrum.by",
  seoDescription: "<из оригинала meta description>",
  ogImage: "/img/guide-inspect.jpg",
  body: [ /* Block[] extracted from the original HTML */ ] as unknown as Prisma.InputJsonValue,
};
```

- [ ] **6a — inspect** (`kak-proverit-avto-pered-pokupkoy.html` → `inspect.ts`): convert the full article body to `Block[]` (headings w/ anchors, paragraphs w/ spans, lists, `callout tip/warn`, cross-links). Category Чек-лист / `var(--blue)` / guide-inspect.jpg / 7 мин. SEO from the file's `<title>`/`<meta description>`.
- [ ] **6b — probeg** (`priznaki-skruchennogo-probega.html` → `probeg.ts`): Риски / `#9a6300` / guide-odometer.jpg / 5 мин.
- [ ] **6c — voprosy** (`voprosy-prodavcu.html` → `voprosy.ts`): Переговоры / `#0a7a48` / guide-questions.jpg / 6 мин.
- [ ] **6d — stoimost** (`stoimost-vladeniya.html` → `stoimost.ts`): Деньги / `var(--blue-ink)` / guide-cost.jpg / 8 мин. Includes the `table` block for «costs».
- [ ] **6e — news** (`news.ts`): export `newsPosts: Prisma.PostCreateInput[]` — 6 items, `kind:"news"`, category «Новость», `categoryColor:"var(--ink-3)"`, no cover (placeholder), `feedTag:"Новость"`, a 1–2 paragraph `body`, `publishedAt` spread across recent dates so they sort after the guides. Titles/excerpts: short pre-launch placeholders in the original's tone (no fabricated statistics).

- [ ] **Verify (each):** the module type-checks against `Prisma.PostCreateInput` (`npx tsc --noEmit`).

---

### Task 7: Seed assembly + run

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Assemble** — `prisma/seed.ts` imports the 4 article consts + `newsPosts`, and upserts each by slug:

```ts
import { PrismaClient, type Prisma } from "@prisma/client";
import { inspectPost } from "./seed-data/inspect";
import { probegPost } from "./seed-data/probeg";
import { voprosyPost } from "./seed-data/voprosy";
import { stoimostPost } from "./seed-data/stoimost";
import { newsPosts } from "./seed-data/news";

const prisma = new PrismaClient();

async function main() {
  const all: Prisma.PostCreateInput[] = [inspectPost, probegPost, voprosyPost, stoimostPost, ...newsPosts];
  for (const p of all) {
    await prisma.post.upsert({ where: { slug: p.slug }, create: p, update: p });
  }
  console.log(`seeded ${all.length} posts`);
}
main().finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run** — `docker compose up -d db` (if down), `npx prisma db seed`. Expected: `seeded 10 posts`.
- [ ] **Step 3: Verify** — query: `10` rows; 4 `article` + 6 `news`.

---

### Task 8: Build + verify + review

- [ ] **Step 1:** `npx tsc --noEmit` (0), `npm run lint` (clean), `npm run build` (green).
- [ ] **Step 2:** `npm run start` (PORT 3300); check: `/novosti` lists 5 posts + pager to page 2; `/novosti?page=2` shows the rest; each `/novosti/<slug>` renders body (headings, callouts, table for stoimost, TOC); landing Guides/Nav/Footer link to the new routes.
- [ ] **Step 3:** Screenshot-compare one article (`kak-proverit...`) vs the original HTML for parity; check `<title>`/OG/JSON-LD present on a detail page and on `/novosti`.
- [ ] **Step 4:** Mobile (390) + tablet (768): no horizontal overflow; `.news-item` stacks <720px.
- [ ] **Step 5 (adversarial review):** verify blocks render faithfully (no lost callouts/tables), SEO meta correct, a11y (headings order, img alt, focus states). Report defects.

---

## Self-Review

**Spec coverage:** model (T1) ✓ · blocks+renderer (T1,T2) ✓ · `/novosti` + pagination (T3) ✓ · `/novosti/[slug]` + SEO/JSON-LD (T4) ✓ · landing link updates (T5) ✓ · seed 10 posts, 4 articles from HTML + 6 news (T6,T7) ✓ · build/verify/review (T8) ✓. No gaps.

**Placeholder scan:** content of the 4 article bodies is intentionally generated by T6 agents from the source HTML (that IS the task) — the module *shape* and all field values except `body`/`excerpt`/`seoDescription` are given; those three are extracted verbatim from the named source file. No "TBD" in scaffolding tasks.

**Type consistency:** `Block`/`Span` (T1) used by `PostBody` (T2) and seed-data (T6); `listPosts`/`getPostBySlug`/`getAllSlugs` (T1) used by T3/T4; `Prisma.PostCreateInput` (T6) consumed by T7. Names consistent.

## Execution mapping to the swarm (dispatching-parallel-agents)

- **Phase 1 (sequential foundation):** Tasks 1 → 2 → 3 → 4 → 5.
- **Phase 2 (parallel swarm):** Tasks 6a–6e concurrently (independent files).
- **Phase 3:** Task 7 (assemble + migrate + seed).
- **Phase 4:** Task 8 (build + verify + adversarial review).
- Status to user every ~5 min; final report on completion.
