import type { NextRequest } from "next/server";

import { HttpError, isHttps, isSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { SURVEY_OPTION_KEYS, voteSchema } from "@/lib/validation";

const VOTE_COOKIE = "vrum_voted";

export async function POST(request: NextRequest) {
  // CSRF guard: reject cross-site browser POSTs.
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Soft one-vote-per-browser: if the vote cookie is already set, don't insert
  // again. It's clearable (not bulletproof — real one-per-user needs identity),
  // but combined with the rate limit it blunts casual ballot-stuffing.
  if (request.cookies.get(VOTE_COOKIE)) {
    return Response.json({ ok: true, deduped: true });
  }

  // Per-IP rate limit: 20 votes / minute. Fail open when no IP is resolvable.
  const ip = getClientIp(request);
  if (ip) {
    const limit = rateLimit(`vote:${ip}`, 20, 60_000);
    if (!limit.ok) {
      return Response.json(
        { ok: false, error: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
  }

  let body: unknown;
  try {
    body = await readJson(request); // JSON-only, size-capped
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ ok: false, error: err.code }, { status: err.status });
    }
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  try {
    await prisma.vote.create({ data: { optionKey: parsed.data.optionKey } });
  } catch (err) {
    console.error("vote failed", err);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // Set the soft-dedupe cookie (1 year, HttpOnly, Lax; Secure over HTTPS).
  const secure = isHttps(request) ? " Secure;" : "";
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${VOTE_COOKIE}=1; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax;${secure}`,
      },
    },
  );
}

export async function GET() {
  try {
    const grouped = await prisma.vote.groupBy({
      by: ["optionKey"],
      _count: { _all: true },
    });

    const counts = new Map(
      grouped.map((row) => [row.optionKey, row._count._all]),
    );

    // Return a stable, complete tally: every known survey option, with 0 for
    // options that have not been voted for yet.
    const tallies = SURVEY_OPTION_KEYS.map((optionKey) => ({
      optionKey,
      count: counts.get(optionKey) ?? 0,
    }));

    const total = tallies.reduce((sum, t) => sum + t.count, 0);

    return Response.json({ ok: true, total, tallies });
  } catch (err) {
    console.error("vote tally failed", err);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
