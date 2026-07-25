import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

const BASE = "https://vrum.by";

// Query the DB per request (not baked at build) so the sitemap stays correct
// even if the build host can't reach the database and reflects new posts.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    select: { slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/novosti/${p.slug}`,
    lastModified: p.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/novosti`, changeFrequency: "daily", priority: 0.8 },
    ...postEntries,
  ];
}
