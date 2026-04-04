class LikesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async toggleLike(userId, entityId, entityType) {
    const isPost = entityType === 'post';
    
    const whereClause = isPost 
      ? { userId, postId: entityId }
      : { userId, commentId: entityId };

    const existingLike = await this.prisma.like.findFirst({
      where: whereClause
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: { id: existingLike.id }
      });
      return { action: 'unliked', liked: false };
    } else {
      // Like
      const likeData = isPost 
        ? { userId, postId: entityId }
        : { userId, commentId: entityId };
        
      await this.prisma.like.create({
        data: likeData
      });
      return { action: 'liked', liked: true };
    }
  }
}

module.exports = LikesService;
