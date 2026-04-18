-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "repliesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "commentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Like_postId_createdAt_id_idx" ON "Like"("postId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Post_visibility_createdAt_idx" ON "Post"("visibility", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_authorId_visibility_createdAt_idx" ON "Post"("authorId", "visibility", "createdAt" DESC);
