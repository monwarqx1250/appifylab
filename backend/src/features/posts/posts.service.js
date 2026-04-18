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
    console.log(`[getFeedPosts] Start`);

    const cache = require('../../services/cache.service');
    const cachedFeed = await cache.getFeed(userId, page, takeLimit);
    if (cachedFeed) {
      console.log(`[getFeedPosts] Cache hit: ${Date.now() - startTime}ms`);
      return cachedFeed;
    }

    const posts = await this.prisma.post.findMany({
      where: { OR: [{ visibility: 'public' }, { visibility: 'private', authorId: userId }] },
      take: takeLimit + 1,
      skip,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true, content: true, visibility: true, authorId: true,
        authorFirstName: true, authorLastName: true, createdAt: true,
        likesCount: true, commentsCount: true, hasAttachments: true, attachments: true,
        likes: { where: { userId }, select: { id: true } }
      }
    });
    console.log(`[getFeedPosts] DB: ${Date.now() - startTime}ms`);

    if (posts.length === 0) return { posts: [], hasMore: false };

    const postIds = posts.map(p => p.id);
    const hasMore = posts.length > takeLimit;
    const feedPosts = hasMore ? posts.slice(0, takeLimit) : posts;
    const feedPostIds = feedPosts.map(p => p.id);
    const feedPostIdSet = new Set(feedPostIds);

    const [likersMap, commentMap] = await Promise.all([
      cache.getPostLikersBatch(feedPostIds),
      cache.getPostCommentsBatch(feedPostIds)
    ]);

    const likedBy = {};
    const comments = {};
    const missIds = new Set();

    feedPosts.forEach(p => {
      const lid = likersMap[p.id];
      const cid = commentMap[p.id];
      likedBy[p.id] = lid || [];
      comments[p.id] = cid || [];
      if (!lid && !cid) missIds.add(p.id);
    });
    console.log(`[getFeedPosts] Cache check: ${Date.now() - startTime}ms`);

    if (missIds.size > 0) {
      const midArr = [...missIds];
      const [lRows, cRows] = await Promise.all([
        this.prisma.$queryRaw`
          SELECT p.id AS pid, l.uid AS uid, u."firstName" AS fn, u."lastName" AS ln FROM "Post" p
          LEFT JOIN LATERAL (SELECT "userId" AS uid FROM "Like" WHERE "postId" = p.id ORDER BY "createdAt" DESC LIMIT 5) l ON TRUE
          LEFT JOIN "User" u ON u.id = l.uid WHERE p.id IN (${Prisma.join(midArr)})`,
        this.prisma.$queryRaw`
          SELECT p.id AS pid, c.id AS cid, c.content AS cct, c."createdAt" AS cca, c."likesCount" AS lcc, c."repliesCount" AS rcc,
            ca.id AS caid, ca."firstName" AS cfn, ca."lastName" AS cln, cl.id AS clid
          FROM "Post" p
          LEFT JOIN LATERAL (SELECT id, content, "createdAt", "likesCount", "repliesCount", "authorId" FROM "Comment" WHERE "postId" = p.id AND "parentId" IS NULL ORDER BY "createdAt" DESC LIMIT 2) c ON TRUE
          LEFT JOIN "User" ca ON ca.id = c."authorId"
          LEFT JOIN "Like" cl ON cl."commentId" = c.id AND cl."userId" = ${userId}
          WHERE p.id IN (${Prisma.join(midArr)})`
      ]);

      lRows.forEach(r => { if (r.uid && likedBy[r.pid]) likedBy[r.pid].push({ id: r.uid, name: `${r.fn} ${r.ln}`.trim() }); });
      cRows.forEach(r => { if (r.cid) (comments[r.pid] = comments[r.pid] || []).push({ id: r.cid, author: { id: r.caid, name: `${r.cfn} ${r.cln}`.trim() }, content: r.cct, createdAt: r.cca, likes: Number(r.lcc), repliesCount: Number(r.rcc), isLiked: !!r.clid }); });

      [...missIds].forEach(id => { if (likedBy[id]?.length) cache.setPostLikers(id, likedBy[id]); if (comments[id]?.length) cache.setPostComments(id, comments[id]); });
    }
    console.log(`[getFeedPosts] SQL: ${Date.now() - startTime}ms`);

    const result = {
      posts: feedPosts.map(p => ({
        id: p.id, content: p.content, visibility: p.visibility, createdAt: p.createdAt,
        author: { id: p.authorId, firstName: p.authorFirstName, lastName: p.authorLastName, name: `${p.authorFirstName} ${p.authorLastName}`.trim() },
        likesCount: p.likesCount, commentsCount: p.commentsCount, hasAttachments: p.hasAttachments,
        isLiked: p.likes?.length > 0, likedBy: likedBy[p.id] || [],
        attachments: p.attachments?.map(a => ({ ...a, fileUrl: this.formatAttachmentUrl(a.fileUrl) })) || [],
        comments: (comments[p.id] || []).map(c => ({ id: c.id, postId: p.id, author: c.author, content: c.content, timestamp: this.formatTimeAgo(c.createdAt), likes: c.likes, isLiked: c.isLiked, repliesCount: c.repliesCount }))
      })),
      hasMore
    };

    cache.setFeed(userId, page, takeLimit, result);
    console.log(`[getFeedPosts] Done: ${Date.now() - startTime}ms`);
    return result;
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
