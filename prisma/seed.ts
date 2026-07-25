import { PrismaClient, type Prisma } from "@prisma/client";

import { inspectPost } from "./seed-data/inspect";
import { newsPosts } from "./seed-data/news";
import { probegPost } from "./seed-data/probeg";
import { stoimostPost } from "./seed-data/stoimost";
import { voprosyPost } from "./seed-data/voprosy";

const prisma = new PrismaClient();

async function main() {
  const all: Prisma.PostCreateInput[] = [
    inspectPost,
    probegPost,
    voprosyPost,
    stoimostPost,
    ...newsPosts,
  ];

  for (const post of all) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      create: post,
      update: post,
    });
  }

  console.log(`seeded ${all.length} posts`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
