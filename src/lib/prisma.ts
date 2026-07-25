import { PrismaClient } from "@prisma/client";

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
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
