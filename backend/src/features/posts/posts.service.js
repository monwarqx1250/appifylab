class PostsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createPost(userId, data) {
    return await this.prisma.post.create({
      data: {
        content: data.content,
        visibility: data.visibility || 'public',
        authorId: userId
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });
  }

  async getFeedPosts(userId, page, limit) {
    const skip = (page - 1) * limit;

    // Fetch Public Posts OR Private Posts authored by the User
    return await this.prisma.post.findMany({
      where: {
        OR: [
          { visibility: 'public' },
          { visibility: 'private', authorId: userId }
        ]
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });
  }
}

module.exports = PostsService;
