class LikesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async toggleLike(userId, entityId, entityType) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_entityId_entityType: {
          userId,
          entityId,
          entityType
        }
      }
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: { id: existingLike.id }
      });
      return { action: 'unliked', entityId, entityType };
    } else {
      // Like
      const newLike = await this.prisma.like.create({
        data: {
          userId,
          entityId,
          entityType
        }
      });
      return { action: 'liked', like: newLike };
    }
  }
}

module.exports = LikesService;
