/*
  Warnings:

  - You are about to drop the column `topComments` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `topLikers` on the `Post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Comment_postId_createdAt_idx";

-- DropIndex
DROP INDEX "Post_authorId_visibility_createdAt_id_idx";

-- DropIndex
DROP INDEX "Post_visibility_createdAt_id_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "topComments",
DROP COLUMN "topLikers";

-- CreateIndex
CREATE INDEX "Post_visibility_createdAt_idx" ON "Post"("visibility", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_authorId_visibility_createdAt_idx" ON "Post"("authorId", "visibility", "createdAt" DESC);
