/**
 * Post management CLI (no admin UI yet).
 *
 *   npx tsx scripts/manage-post.ts <command> <slug>
 *
 * Commands:
 *   publish    → status=published AND publishedAt=now()  ← use this to go live
 *   unpublish  → status=draft   (keeps publishedAt as-is)
 *   archive    → status=archived
 *   pin        → pinned=true     (force to top of the feed)
 *   unpin      → pinned=false
 *
 * `publish` re-stamps publishedAt to the current moment, so a post that sat in
 * draft for days still lands at the top of the feed the day it goes live.
 */
import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [command, slug] = process.argv.slice(2);
  if (!command || !slug) {
    console.error(
      "usage: npx tsx scripts/manage-post.ts <publish|unpublish|archive|pin|unpin> <slug>",
    );
    process.exit(1);
  }

  const data: Prisma.PostUpdateInput = {};
  switch (command) {
    case "publish":
      data.status = "published";
      data.publishedAt = new Date();
      break;
    case "unpublish":
      data.status = "draft";
      break;
    case "archive":
      data.status = "archived";
      break;
    case "pin":
      data.pinned = true;
      break;
    case "unpin":
      data.pinned = false;
      break;
    default:
      console.error(`unknown command: ${command}`);
      process.exit(1);
  }

  try {
    const res = await prisma.post.update({ where: { slug }, data });
    console.log(`ok: ${command} ${slug}`, {
      status: res.status,
      pinned: res.pinned,
      publishedAt: res.publishedAt,
    });
  } catch {
    console.error(`no post with slug "${slug}"`);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());
