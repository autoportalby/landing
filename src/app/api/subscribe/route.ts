import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";

import { HttpError, isSameOrigin, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { subscribeSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  // CSRF guard: reject cross-site browser POSTs.
  if (!isSameOrigin(request)) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // Per-IP rate limit: 10 signups / minute. Fail open when no IP is resolvable
  // (local/dev without forwarding headers) so we never 429 everyone at once.
  const ip = getClientIp(request);
  if (ip) {
    const limit = rateLimit(`subscribe:${ip}`, 10, 60_000);
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

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    // Generic message — don't leak the schema shape to unauthenticated callers.
    return Response.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { email, source } = parsed.data;

  try {
    await prisma.subscriber.create({ data: { email, source } });
  } catch (err) {
    // Duplicate email hits the unique constraint (P2002). This is expected and
    // idempotent from the caller's perspective, so we treat it as success.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return Response.json({ ok: true, deduped: true });
    }
    console.error("subscribe failed", err);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

// Public subscriber count — powers the "N человек уже ждут запуска" line.
export async function GET() {
  try {
    const count = await prisma.subscriber.count();
    return Response.json({ ok: true, count });
  } catch (err) {
    console.error("subscriber count failed", err);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
