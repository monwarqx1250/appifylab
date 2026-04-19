-- DropIndex
DROP INDEX "Post_authorId_visibility_createdAt_idx";

-- DropIndex
DROP INDEX "Post_visibility_createdAt_idx";

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Post_visibility_createdAt_id_idx" ON "Post"("visibility", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Post_authorId_visibility_createdAt_id_idx" ON "Post"("authorId", "visibility", "createdAt" DESC, "id" DESC);
