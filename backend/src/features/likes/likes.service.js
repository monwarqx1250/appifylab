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
      await this.prisma.like.delete({
        where: { id: existingLike.id }
      });
      if (isPost) {
        await this.prisma.post.update({
          where: { id: entityId },
          data: { likesCount: { decrement: 1 } }
        });
      } else {
        await this.prisma.comment.update({
          where: { id: entityId },
          data: { likesCount: { decrement: 1 } }
        });
      }
if (isPost) {
        await this.prisma.post.update({
          where: { id: entityId },
          data: { likesCount: { decrement: 1 } }
        });
        await this.updateTopLikers(entityId);
      } else {
        await this.prisma.comment.update({
          where: { id: entityId },
          data: { likesCount: { decrement: 1 } }
        });
      }
      return { action: 'unliked', liked: false };
    } else {
      const likeData = isPost 
        ? { userId, postId: entityId }
        : { userId, commentId: entityId };
        
      await this.prisma.like.create({
        data: likeData
      });
      if (isPost) {
        await this.prisma.post.update({
          where: { id: entityId },
          data: { likesCount: { increment: 1 } }
        });
        await this.updateTopLikers(entityId);
      } else {
        await this.prisma.comment.update({
          where: { id: entityId },
          data: { likesCount: { increment: 1 } }
        });
      }
      return { action: 'liked', liked: true };
    }
  }

  async updateTopLikers(postId) {
    const topLikers = await this.prisma.$queryRaw`
      SELECT u.id, u."firstName", u."lastName" FROM "Like" l
      JOIN "User" u ON u.id = l."userId"
      WHERE l."postId" = ${postId}
      ORDER BY l."createdAt" DESC, l.id DESC
      LIMIT 5
    `;
    const likers = topLikers.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() }));
    await this.prisma.post.update({
      where: { id: postId },
      data: { topLikers: JSON.stringify(likers) }
    });
  }

  async getCommentLikers(commentId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return null;
    }

    const likers = await this.prisma.like.findMany({
      where: { commentId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalLikes = comment.likesCount;
    const hasMore = skip + likers.length < totalLikes;

    return {
      likers: likers.map(like => ({
        id: like.user.id,
        firstName: like.user.firstName,
        lastName: like.user.lastName
      })),
      hasMore,
      totalLikes
    };
  }
}

module.exports = LikesService;
