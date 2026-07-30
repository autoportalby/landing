import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { NEWS_TAG } from "@/lib/posts";

/**
 * Cache invalidation, called by the admin panel after a publish or unpublish.
 *
 * The admin writes that intent into its outbox inside the same transaction as the
 * status change and a relay delivers it here, retrying until it lands — so an
 * editor's "publish" reaches the site even if this call fails the first time.
 *
 * The secret is compared in constant time: an early return on a mismatch turns
 * this endpoint into an oracle for guessing it.
 */
export async function POST(request: Request) {
  const provided = request.headers.get("x-revalidate-secret") ?? "";
  const expected = process.env.LANDING_REVALIDATE_SECRET ?? "";

  if (!expected || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[] };
  const tags = body.tags?.length ? body.tags : [NEWS_TAG];

  // expire: 0 — never serve a stale value, even briefly: an editor expects a
  // published article to appear immediately.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: tags });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
