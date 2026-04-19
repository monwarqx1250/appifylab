-- CreateIndex
CREATE INDEX "Like_commentId_createdAt_id_idx" ON "Like"("commentId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Like_userId_postId_createdAt_id_idx" ON "Like"("userId", "postId", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Like_userId_commentId_createdAt_id_idx" ON "Like"("userId", "commentId", "createdAt" DESC, "id" DESC);
