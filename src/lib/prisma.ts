import { PrismaClient } from "@prisma/client";

// Pooled connection string used by the runtime app. On a "prod run" (Vercel)
// we prefer the production database; locally we always use DATABASE_URL. Keying
// on VERCEL (not NODE_ENV) matters: a local `next build` also sets
// NODE_ENV=production, and we do NOT want that to hit the prod DB just because
// the prod credentials happen to sit in .env. If DATABASE_PROD_URL is unset on
// Vercel we fall back to DATABASE_URL, so setting DATABASE_URL directly in the
// Vercel dashboard also works.
const datasourceUrl =
  process.env.VERCEL && process.env.DATABASE_PROD_URL
    ? process.env.DATABASE_PROD_URL
    : process.env.DATABASE_URL;

// PrismaClient singleton. In development Next.js hot-reloads modules, which
// would otherwise create a new client (and a new connection pool) on every
// reload and exhaust the database connections. We cache the instance on
// globalThis so it survives reloads.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
