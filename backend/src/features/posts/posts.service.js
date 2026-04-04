const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || '/uploads';

class PostsService {
  constructor(prisma, userId = null) {
    this.prisma = prisma;
    this.userId = userId;
  }

  formatAttachmentUrl(filename) {
    return `${UPLOAD_BASE_URL}/${filename}`;
  }

  async createPost(userId, data) {
    const { content, visibility, files } = data;
    
    const post = await this.prisma.post.create({
      data: {
        content,
        visibility: visibility || 'public',
        authorId: userId,
        attachments: files?.length > 0 ? {
          create: files.map(file => ({
            fileUrl: file.filename,
            fileType: file.mimetype
          }))
        } : undefined
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        attachments: true
      }
    });

    return this.formatPostAttachments(post);
  }

  formatPostAttachments(post) {
    return {
      ...post,
      attachments: (post.attachments || []).map(att => ({
        ...att,
        fileUrl: this.formatAttachmentUrl(att.fileUrl)
      }))
    };
  }

  async getFeedPosts(userId, page, limit) {
    const skip = (page - 1) * limit;

    const posts = await this.prisma.post.findMany({
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
        attachments: true,
        _count: {
          select: { comments: true, likes: true }
        },
        likes: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return posts.map(post => {
      // Check if current user liked by looking at likes array
      const currentUserLiked = post.likes.some(like => like.userId === userId);
      
      return {
        ...this.formatPostAttachments(post),
        isLiked: currentUserLiked,
        likesCount: post._count.likes,
        likedBy: post.likes.map(like => ({
          id: like.user.id,
          name: `${like.user.firstName} ${like.user.lastName}`.trim(),
        }))
      };
    });
  }

  async getAllPosts() {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        attachments: true,
        _count: {
          select: { comments: true, likes: true }
        },
        likes: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    const userId = this.userId;
    return posts.map(post => {
      const currentUserLiked = userId ? post.likes.some(like => like.userId === userId) : false;
      
      return {
        ...this.formatPostAttachments(post),
        isLiked: currentUserLiked,
        likesCount: post._count.likes,
        likedBy: post.likes.map(like => ({
          id: like.user.id,
          name: `${like.user.firstName} ${like.user.lastName}`.trim(),
        }))
      };
    });
  }

  async getPostById(postId) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        attachments: true
      }
    });

    if (!post) return null;
    return this.formatPostAttachments(post);
  }

  async getPostLikers(postId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!post) {
      return null;
    }

    const likers = await this.prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalLikes = post._count.likes;
    const hasMore = skip + likers.length < totalLikes;

    return {
      likers: likers.map(like => ({
        id: like.user.id,
        firstName: like.user.firstName,
        lastName: like.user.lastName
      })),
      totalLikes,
      hasMore
    };
  }

  async updatePost(postId, userId, data) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return null;
    }

    if (existingPost.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        content: data.content ?? existingPost.content,
        visibility: data.visibility ?? existingPost.visibility
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        attachments: true
      }
    });

    return this.formatPostAttachments(post);
  }

  async deletePost(postId, userId) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return null;
    }

    if (existingPost.authorId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.prisma.post.delete({
      where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
  }
}

module.exports = PostsService;
