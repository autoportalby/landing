import type { MetadataRoute } from "next";

import { listPublishedIndex } from "@/lib/posts";

const BASE = "https://vrum.by";

// Built per request, not baked into the build: a build host that cannot reach the
// admin API still deploys, and newly published material appears without a
// redeploy. An unreachable API yields the two static entries rather than an error.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedIndex();

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/novosti/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/novosti`, changeFrequency: "daily", priority: 0.8 },
    ...postEntries,
  ];
}
