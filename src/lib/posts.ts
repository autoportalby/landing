import type { Block } from "@/lib/blocks";

/**
 * The news feed comes from the admin panel's public API.
 *
 * The admin owns editorial content: it is where material is written, reviewed and
 * published, and it is the only writer to that database. This module is a thin
 * read adapter — it maps the API payload onto the types the pages already use, so
 * the feed and article pages did not have to change when the source moved.
 */

export const PER_PAGE = 5;

const API_URL = process.env.ADMIN_API_URL ?? "http://localhost:4000";

/**
 * How long a fetched feed may be served before it is refreshed. The admin also
 * pushes an invalidation to /api/revalidate on publish, so this is the fallback
 * for when that call never arrives — not the normal path.
 */
const REVALIDATE_SECONDS = 300;

/** Cache tag the admin's invalidation hook busts. */
export const NEWS_TAG = "news";

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

/** The API's card payload. Kept local: it is a contract, not our model. */
type ApiCard = {
  slug: string;
  kind: "article" | "news";
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  category: string | null;
  categoryColor: string | null;
  feedTag: string | null;
  readingMin: number | null;
  publishedAt: string | null;
};

type ApiDetail = ApiCard & {
  bodyBlocks: Block[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  updatedAt: string | null;
};

/**
 * A failed fetch returns null rather than throwing.
 *
 * Pages are prerendered at build time, when the admin API may legitimately not be
 * running, and a missing backend must not fail the build. Callers then
 * distinguish "nothing published" from "could not reach the API" — an empty feed
 * shown during an outage quietly hides it.
 */
async function apiGet<T>(path: string, cache?: RequestInit["cache"]): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      cache,
      next:
        cache === "no-store" ? undefined : { tags: [NEWS_TAG], revalidate: REVALIDATE_SECONDS },
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`[posts] ${path} -> ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[posts] ${path} unreachable:`, error);
    return null;
  }
}

export async function listPosts(page: number, perPage = PER_PAGE) {
  const p = Math.max(1, page || 1);

  const data = await apiGet<{ items: ApiCard[]; total: number; pages: number; page: number }>(
    `/public/news?page=${p}&limit=${perPage}`,
  );

  if (!data) {
    // `unavailable` is what lets the page say "the feed is temporarily
    // unavailable" instead of "there is nothing here yet".
    return { posts: [], total: 0, pages: 1, page: p, unavailable: true };
  }

  return {
    posts: data.items.map(toListItem),
    total: data.total,
    pages: Math.max(1, data.pages),
    page: data.page,
    unavailable: false,
  };
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  // no-store: the article page renders per request, so unpublishing a post in the
  // admin takes it off the site immediately.
  const row = await apiGet<ApiDetail>(`/public/news/${encodeURIComponent(slug)}`, "no-store");
  if (!row) return null;

  return {
    ...toListItem(row),
    seoTitle: row.seoTitle ?? row.title,
    seoDescription: row.seoDescription ?? row.excerpt ?? "",
    ogImage: row.ogImage,
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : null,
    body: row.bodyBlocks ?? [],
  };
}

export async function getAllSlugs(): Promise<string[]> {
  return (await listPublishedIndex()).map((p) => p.slug);
}

export type PublishedIndexEntry = {
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date | null;
};

/** Every published slug with its dates — what a sitemap or a feed needs. */
export async function listPublishedIndex(): Promise<PublishedIndexEntry[]> {
  const data = await apiGet<{
    items: { slug: string | null; publishedAt: string | null; updatedAt: string | null }[];
  }>("/public/news/index/all");
  if (!data) return [];

  return data.items
    .filter((i): i is { slug: string; publishedAt: string | null; updatedAt: string | null } =>
      Boolean(i.slug),
    )
    .map((i) => ({
      slug: i.slug,
      publishedAt: i.publishedAt ? new Date(i.publishedAt) : null,
      updatedAt: i.updatedAt ? new Date(i.updatedAt) : null,
    }));
}

function toListItem(row: ApiCard): PostListItem {
  return {
    slug: row.slug,
    kind: row.kind,
    // The feed styles a category pill from these; material without them still
    // renders, in the brand colour, rather than breaking the card.
    category: row.category ?? "",
    categoryColor: row.categoryColor ?? "var(--blue)",
    title: row.title,
    excerpt: row.excerpt ?? "",
    coverImage: row.coverUrl,
    readingMin: row.readingMin,
    feedTag: row.feedTag ?? "",
    publishedAt: row.publishedAt ? new Date(row.publishedAt) : new Date(0),
  };
}
