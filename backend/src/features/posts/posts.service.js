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
          where: { userId }
        }
      }
    });

    return posts.map(post => ({
      ...this.formatPostAttachments(post),
      isLiked: post.likes.length > 0,
      likesCount: post._count.likes,
    }));
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
        likes: true
      }
    });

    const userId = this.userId;
    return posts.map(post => ({
      ...this.formatPostAttachments(post),
      isLiked: userId ? post.likes.some(like => like.userId === userId) : false,
      likesCount: post._count.likes,
    }));
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
