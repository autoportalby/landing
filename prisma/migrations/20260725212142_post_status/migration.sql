-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'archived', 'published');

-- DropIndex
DROP INDEX "Post_publishedAt_idx";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'published';

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
