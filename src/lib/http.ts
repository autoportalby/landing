import type { NextRequest } from "next/server";

/**
 * Request guards for the public write endpoints.
 *
 * These are dependency-free mitigations suitable for a pre-launch app:
 *  - same-origin check  → blunts cross-site (CSRF) POSTs
 *  - Content-Type check → blocks the `text/plain` form-POST CSRF trick
 *  - size-capped body   → prevents unbounded-body memory exhaustion
 */

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

/**
 * True unless the request is a cross-site browser POST.
 *
 * Browsers always attach an `Origin` header to POST (even same-origin), so a
 * present-but-mismatched Origin means a cross-site request → reject. A missing
 * Origin is a non-browser client (curl, server-to-server), which is not a CSRF
 * vector, so we allow it.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Whether the request arrived over HTTPS (used to gate the Secure cookie flag). */
export function isHttps(request: NextRequest): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0]?.trim() === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Read and JSON-parse a small request body, enforcing a hard byte cap by
 * streaming (so an oversized payload is aborted before it is fully buffered)
 * and requiring an `application/json` Content-Type.
 *
 * Throws {@link HttpError} with an appropriate status on any violation.
 */
export async function readJson(
  request: NextRequest,
  maxBytes = 2048,
): Promise<unknown> {
  const ct = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!ct.includes("application/json")) {
    throw new HttpError(415, "unsupported_media_type");
  }

  // Early reject via the advertised length (cheap; may be absent/spoofed).
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new HttpError(413, "payload_too_large");
  }

  const text = await readTextCapped(request, maxBytes);
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

async function readTextCapped(
  request: NextRequest,
  maxBytes: number,
): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return request.text();

  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, "payload_too_large");
      }
      chunks.push(value);
    }
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}
