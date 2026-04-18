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
        attachments: true,
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });

    const result = {
      ...this.formatPostAttachments(post),
      isLiked: false,
      likesCount: 0,
      likedBy: [],
      commentCount: 0,
      comments: [],
    };
    
    return result;
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
    const takeLimit = parseInt(limit, 10);

    const fetchedPosts = await this.prisma.post.findMany({
      where: {
        OR: [
          { visibility: 'public' },
          { visibility: 'private', authorId: userId }
        ]
      },
      skip,
      take: takeLimit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true }
        },
        attachments: true,
        _count: {
          select: { comments: true, likes: true }
        },
        comments: {
          where: { parentId: null },
          take: 2,
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { replies: true, likes: true } },
            likes: {
              where: { userId },
              select: { id: true }
            }
          }
        }
      }
    });

    const hasMore = fetchedPosts.length > takeLimit;
    const posts = hasMore ? fetchedPosts.slice(0, takeLimit) : fetchedPosts;

    const postIds = posts.map(p => p.id);
    const [currentUserLikes, latestLikes] = postIds.length === 0
      ? [[], []]
      : await Promise.all([
        this.prisma.like.findMany({
          where: {
            userId,
            postId: { in: postIds }
          },
          select: { postId: true }
        }),
        this.prisma.$queryRaw`
          WITH ranked_likes AS (
            SELECT
              l."postId",
              u.id AS "userId",
              u."firstName",
              u."lastName",
              ROW_NUMBER() OVER (
                PARTITION BY l."postId"
                ORDER BY l."createdAt" DESC, l.id DESC
              ) AS row_num
            FROM "Like" l
            JOIN "User" u ON u.id = l."userId"
            WHERE l."postId" IN (${Prisma.join(postIds)})
          )
          SELECT "postId", "userId", "firstName", "lastName", row_num
          FROM ranked_likes
          WHERE row_num <= 5
          ORDER BY "postId", row_num
        `
      ]);

    const likedPostIds = new Set(currentUserLikes.map(like => like.postId));

    const likesByPostId = latestLikes.reduce((acc, like) => {
      if (!acc[like.postId]) acc[like.postId] = [];
      acc[like.postId].push({
        id: like.userId,
        name: `${like.firstName} ${like.lastName}`.trim(),
      });
      return acc;
    }, {});

    return {
      posts: posts.map(post => ({
        ...this.formatPostAttachments(post),
        isLiked: likedPostIds.has(post.id),
        likesCount: post._count.likes,
        likedBy: likesByPostId[post.id] || [],
        commentCount: post._count.comments,
        comments: post.comments.map(comment => this.formatComment(comment, post.id))
      })),
      hasMore
    };
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
      likes: comment._count?.likes || 0,
      isLiked: comment.likes?.length > 0 || comment.isLiked || false,
      repliesCount: comment._count?.replies || 0,
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
