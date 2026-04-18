const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
  constructor() {
    this.redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
    
    this.redis.on('error', (err) => {
      console.error('[Cache] Redis error:', err.message);
    });
    
    this.TTL = 300;
  }

  async getPostLikers(postId) {
    const key = `post:${postId}:likers`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setPostLikers(postId, likers) {
    const key = `post:${postId}:likers`;
    await this.redis.setex(key, this.TTL, JSON.stringify(likers));
  }

  async getPostComments(postId) {
    const key = `post:${postId}:comments`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setPostComments(postId, comments) {
    const key = `post:${postId}:comments`;
    await this.redis.setex(key, this.TTL, JSON.stringify(comments));
  }

  async invalidatePost(postId) {
    const keys = [
      `post:${postId}:likers`,
      `post:${postId}:comments`
    ];
    await this.redis.del(...keys);
  }

  async getPostLikersBatch(postIds) {
    if (postIds.length === 0) return {};
    const keys = postIds.map(id => `post:${id}:likers`);
    const values = await this.redis.mget(...keys);
    const result = {};
    for (let i = 0; i < postIds.length; i++) {
      if (values[i]) result[postIds[i]] = JSON.parse(values[i]);
    }
    return result;
  }

  async getPostCommentsBatch(postIds) {
    if (postIds.length === 0) return {};
    const keys = postIds.map(id => `post:${id}:comments`);
    const values = await this.redis.mget(...keys);
    const result = {};
    for (let i = 0; i < postIds.length; i++) {
      if (values[i]) result[postIds[i]] = JSON.parse(values[i]);
    }
    return result;
  }

  async getPostBatch(postIds) {
    if (postIds.length === 0) return {};
    const keys = postIds.map(id => `post:data:${id}`);
    const values = await this.redis.mget(...keys);
    const result = {};
    for (let i = 0; i < postIds.length; i++) {
      if (values[i]) result[postIds[i]] = JSON.parse(values[i]);
    }
    return result;
  }

  async getFeed(userId, page, limit) {
    const key = `feed:${userId}:${page}:${limit}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

async setFeed(userId, page, limit, data) {
    const key = `feed:${userId}:${page}:${limit}`;
    await this.redis.setex(key, 60, JSON.stringify(data));
  }

  async prependToFeed(userId, post, limit = 10) {
    const key = `feed:${userId}:1:${limit}`;
    const cached = await this.redis.get(key);
    if (cached) {
      const feed = JSON.parse(cached);
      feed.posts.unshift(post);
      feed.posts = feed.posts.slice(0, limit);
      await this.redis.setex(key, 60, JSON.stringify(feed));
    }
  }

  async invalidateAllFeeds() {
    const keys = await this.redis.keys('feed:*');
    if (keys.length > 0) await this.redis.del(...keys);
  }

  async invalidateFeed(userId) {
    if (userId) {
      const keys = await this.redis.keys(`feed:${userId}:*`);
      if (keys.length > 0) await this.redis.del(...keys);
    }
  }

  async invalidateAllFeeds() {
    const keys = await this.redis.keys('feed:*');
    if (keys.length > 0) await this.redis.del(...keys);
  }

  async setPost(post) {
    const key = `post:data:${post.id}`;
    await this.redis.setex(key, this.TTL, JSON.stringify(post));
  }

  async invalidatePost(postId) {
    const keys = [
      `post:${postId}:likers`,
      `post:${postId}:comments`,
      `post:data:${postId}`
    ];
    await this.redis.del(...keys);
    await this.invalidateFeed();
  }

  async disconnect() {
    await this.redis.quit();
  }
}

module.exports = new CacheService();