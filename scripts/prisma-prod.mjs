// Run a Prisma CLI command against the PRODUCTION database.
//
// Prisma's datasource reads env("DATABASE_URL")/env("DIRECT_URL"), and Prisma
// respects env vars already set in the process over anything in .env. This
// wrapper maps the *_PROD_URL values onto those names, then execs prisma.
//
// Invoked via npm scripts with Node's built-in --env-file so .env is loaded
// without any extra dependency:
//   node --env-file=.env scripts/prisma-prod.mjs <prisma args...>
//
// Examples (see package.json):
//   npm run db:deploy:prod   -> prisma migrate deploy against prod
//   npm run db:seed:prod     -> prisma db seed against prod
//   npm run db:studio:prod   -> prisma studio against prod
import { spawnSync } from "node:child_process";

const pooled = process.env.DATABASE_PROD_URL;
const direct = process.env.DIRECT_PROD_URL;

if (!pooled || !direct) {
  console.error(
    "Missing DATABASE_PROD_URL / DIRECT_PROD_URL. Add them to .env " +
      "(they are gitignored) before running a :prod command.",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: pooled,
  DIRECT_URL: direct,
};

const args = process.argv.slice(2);
const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
