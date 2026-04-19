class CommentsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  }

  async createComment(userId, data) {
    const { postId, parentId, content } = data;
    const isReply = !!parentId;

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId: userId
      }
    });

    if (isReply) {
      await this.prisma.comment.update({
        where: { id: parentId },
        data: { repliesCount: { increment: 1 } }
      });
    } else {
      await this.prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      });
    }

    const result = await this.prisma.comment.findUnique({
      where: { id: comment.id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    return {
      id: result.id,
      postId: result.postId,
      parentId: result.parentId,
      author: {
        id: result.author.id,
        name: `${result.author.firstName} ${result.author.lastName}`.trim()
      },
      content: result.content,
      timestamp: this.formatTimeAgo(result.createdAt),
      likes: 0,
      isLiked: false,
      repliesCount: 0
    };
  }

  async getCommentsByPostId(postId, userId, page = 1, limit = 3, includeReplies = false) {
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
          likes: userId ? {
            where: { userId },
            select: { id: true }
          } : false
        }
      }),
      this.prisma.comment.count({
        where: whereClause
      })
    ]);

    const hasMore = skip + comments.length < totalCount;

    const commentsWithRepliesCount = comments.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      author: {
        id: comment.author.id,
        name: `${comment.author.firstName} ${comment.author.lastName}`.trim()
      },
      content: comment.content,
      timestamp: this.formatTimeAgo(comment.createdAt),
      likes: comment.likesCount,
      isLiked: userId ? comment.likes?.length > 0 : false,
      repliesCount: comment.repliesCount
    }));

    return {
      comments: commentsWithRepliesCount,
      hasMore,
      totalCount
    };
  }

  async getReplies(commentId, userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const whereClause = { parentId: commentId };

    const [replies, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true }
          },
          likes: userId ? {
            where: { userId },
            select: { id: true }
          } : false
        }
      }),
      this.prisma.comment.count({
        where: whereClause
      })
    ]);

    const hasMore = skip + replies.length < totalCount;

    const repliesData = replies.map(reply => ({
      id: reply.id,
      postId: reply.postId,
      parentId: reply.parentId,
      author: {
        id: reply.author.id,
        name: `${reply.author.firstName} ${reply.author.lastName}`.trim()
      },
      content: reply.content,
      timestamp: this.formatTimeAgo(reply.createdAt),
      likes: reply.likesCount,
      isLiked: userId ? reply.likes?.length > 0 : false,
      repliesCount: reply.repliesCount
    }));

    return {
      comments: repliesData,
      hasMore,
      totalCount
    };
  }

  async getAllComments(postId) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        parent: {
          select: { postId: true }
        }
      }
    });

    return comments.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      author: {
        id: comment.author.id,
        name: `${comment.author.firstName} ${comment.author.lastName}`.trim()
      },
      content: comment.content,
      likes: comment.likesCount,
      repliesCount: comment.repliesCount,
      parent: comment.parent ? { postId: comment.parent.postId } : null
    }));
  }
}

module.exports = CommentsService;
