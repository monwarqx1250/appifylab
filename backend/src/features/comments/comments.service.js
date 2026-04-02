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

  async getCommentsByPostId(postId) {
    // Only return top-level comments; frontend handles replies recursively 
    // or we fetch all and build a tree. For simplicity, fetch all sorted by creation.
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
