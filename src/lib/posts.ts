import { prisma } from "@/lib/prisma";
import type { Block } from "@/lib/blocks";

export const PER_PAGE = 5;

export type PostListItem = {
  slug: string;
  kind: "article" | "news";
  category: string;
  categoryColor: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  readingMin: number | null;
  feedTag: string;
  publishedAt: Date;
};

export type PostDetail = PostListItem & {
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
  updatedAt: Date | null;
  body: Block[];
};

// Only published posts are ever exposed publicly (feed, detail, sitemap).
const PUBLISHED = { status: "published" } as const;

export async function listPosts(page: number, perPage = PER_PAGE) {
  const p = Math.max(1, page || 1);
  const [rows, total] = await Promise.all([
    prisma.post.findMany({
      where: PUBLISHED,
      // Pinned posts first, then newest by publish moment.
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      skip: (p - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where: PUBLISHED }),
  ]);
  const posts = rows.map(toListItem);
  return { posts, total, pages: Math.max(1, Math.ceil(total / perPage)), page: p };
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  // findFirst (not findUnique) so we can also require published — a draft or
  // archived slug resolves to null → the page 404s.
  const row = await prisma.post.findFirst({ where: { slug, ...PUBLISHED } });
  if (!row) return null;
  return {
    ...toListItem(row),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ogImage: row.ogImage,
    updatedAt: row.updatedAt,
    body: row.body as unknown as Block[],
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const rows = await prisma.post.findMany({
    where: PUBLISHED,
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toListItem(row: any): PostListItem {
  return {
    slug: row.slug,
    kind: row.kind,
    category: row.category,
    categoryColor: row.categoryColor,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    readingMin: row.readingMin,
    feedTag: row.feedTag,
    publishedAt: row.publishedAt,
  };
}
