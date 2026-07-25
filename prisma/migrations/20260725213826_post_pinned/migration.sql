-- DropIndex
DROP INDEX "Post_status_publishedAt_idx";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_status_pinned_publishedAt_idx" ON "Post"("status", "pinned", "publishedAt");
