const { Prisma } = require('@prisma/client');

const UPLOAD_BASE_URL = process.env.UPLOAD_BASE_URL || '/uploads';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3001';

const formatUrl = (path) => path.startsWith('http') ? path : `${SITE_URL}${path}`;

class PostsService {
  constructor(prisma, userId = null) {
    this.prisma = prisma;
    this.userId = userId;
  }

  formatAttachmentUrl(fileUrl) {
    return formatUrl(`${UPLOAD_BASE_URL}/${fileUrl}`);
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

  async createPost(userId, data) {
    const { content, visibility, files } = data;
    const hasAttachments = files?.length > 0;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });

    const post = await this.prisma.post.create({
      data: {
        content,
        visibility: visibility || 'public',
        authorId: userId,
        authorFirstName: user.firstName,
        authorLastName: user.lastName,
        hasAttachments,
        attachments: hasAttachments ? {
          create: files.map(file => ({
            fileUrl: file.filename,
            fileType: file.mimetype
          }))
        } : undefined
      },
      include: {
        attachments: true
      }
    });

    const result = {
      ...this.formatPostAttachments(post),
      author: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName
      },
      isLiked: false,
      likesCount: 0,
      likedBy: [],
      commentCount: 0,
      hasAttachments: post.hasAttachments,
      comments: [],
    };

    const cache = require('../../services/cache.service');
    await cache.invalidateAllFeeds();

    return result;
  }

  formatPostAttachments(post) {
    return {
      ...post,
      author: {
        id: post.authorId,
        firstName: post.authorFirstName,
        lastName: post.authorLastName,
        name: `${post.authorFirstName || ''} ${post.authorLastName || ''}`.trim()
      },
      attachments: (post.attachments || []).map(att => ({
        ...att,
        fileUrl: this.formatAttachmentUrl(att.fileUrl)
      }))
    };
  }

  async getFeedPosts(userId, page, limit) {
    const skip = (page - 1) * limit;
    const takeLimit = parseInt(limit, 10);
    const startTime = Date.now();

    const posts = await this.prisma.post.findMany({
      where: {
        visibility: 'public'
      },
      include: {
        likes: {
          where: {
            userId
          }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: takeLimit
    })
    const postIds = posts.map(post => post.id)
    const [comments, likes] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: {
          postId: { in: postIds }
        },
        include: {
          author: {
            select: {id: true, firstName: true, lastName: true}
          }
        },
        take: 2
      }),
      this.prisma.like.findMany({
        where: {
          postId: { in: postIds },
        },
        take: 5,
        include: {
          user: {
            select: {id: true, firstName: true, lastName: true}
          }
        }
      })
    ])
    console.log({
      posts : posts[0],
      comments: comments[0],
      likes: likes[0]
    })
    console.log(`took ${Date.now() - startTime}ms`)

    return {}
  }

  formatComment(comment, postId) {
    return {
      id: comment.id,
      postId: postId,
      author: {
        id: comment.author?.id || comment.authorId,
        name: comment.author ? `${comment.author.firstName} ${comment.author.lastName}`.trim() : 'User',
      },
      content: comment.content,
      timestamp: this.formatTimeAgo(comment.createdAt),
      likes: comment.likesCount || 0,
      isLiked: comment.likes?.length > 0 || comment.isLiked || false,
      repliesCount: comment.repliesCount || 0,
    };
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
      where: { id: postId }
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

    const totalLikes = post.likesCount;
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

    await this.prisma.postAttachment.deleteMany({ where: { postId } });
    await this.prisma.comment.deleteMany({ where: { postId } });
    await this.prisma.like.deleteMany({ where: { postId } });

    await this.prisma.post.delete({
      where: { id: postId }
    });

    return { message: 'Post deleted successfully' };
  }
}

module.exports = PostsService;
