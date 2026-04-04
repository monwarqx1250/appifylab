class CommentsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createComment(userId, data) {
    return await this.prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        parentId: data.parentId || null,
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
  }

  async getCommentsByPostId(postId, page = 1, limit = 3, includeReplies = false) {
    const skip = (page - 1) * limit;
    
    const whereClause = includeReplies 
      ? { postId }
      : { postId, parentId: null };

    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true }
          },
          _count: {
            select: { likes: true, replies: true }
          }
        }
      }),
      this.prisma.comment.count({
        where: whereClause
      })
    ]);

    const hasMore = skip + comments.length < totalCount;

    return {
      comments: comments.reverse(), // oldest first for display
      hasMore,
      totalCount
    };
  }

  async getAllComments(postId) {
    return await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        _count: {
          select: { likes: true, replies: true }
        }
      }
    });
  }
}

module.exports = CommentsService;
