import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import PostsService from '../../src/features/posts/posts.service.js';

describe('PostsService', () => {
  let prisma;
  let postsService;

  beforeEach(async () => {
    prisma = new PrismaClient();
    postsService = new PostsService(prisma);
  });

  describe('createPost', () => {
    it('should create a post without attachments', async () => {
      const userId = 'user-1';
      const data = {
        content: 'Test post content',
        visibility: 'public'
      };

      const mockCreate = vi.fn().mockResolvedValue({
        id: 'post-1',
        content: 'Test post content',
        visibility: 'public',
        authorId: userId,
        author: { id: userId, firstName: 'John', lastName: 'Doe' },
        attachments: []
      });

      prisma.post = { create: mockCreate };
      
      const result = await postsService.createPost(userId, data);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          content: 'Test post content',
          visibility: 'public',
          authorId: userId
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          attachments: true
        }
      });
      expect(result).toHaveProperty('id');
      expect(result.content).toBe('Test post content');
    });

    it('should create a post with attachments', async () => {
      const userId = 'user-1';
      const files = [
        { filename: 'abc123.jpg', mimetype: 'image/jpeg' },
        { filename: 'def456.png', mimetype: 'image/png' }
      ];
      const data = {
        content: 'Post with images',
        visibility: 'public',
        files
      };

      const mockCreate = vi.fn().mockResolvedValue({
        id: 'post-1',
        content: 'Post with images',
        visibility: 'public',
        authorId: userId,
        author: { id: userId, firstName: 'John', lastName: 'Doe' },
        attachments: [
          { id: 'att-1', fileUrl: 'abc123.jpg', fileType: 'image/jpeg' },
          { id: 'att-2', fileUrl: 'def456.png', fileType: 'image/png' }
        ]
      });

      prisma.post = { create: mockCreate };

      const result = await postsService.createPost(userId, data);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          content: 'Post with images',
          visibility: 'public',
          authorId: userId,
          attachments: {
            create: [
              { fileUrl: 'abc123.jpg', fileType: 'image/jpeg' },
              { fileUrl: 'def456.png', fileType: 'image/png' }
            ]
          }
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          attachments: true
        }
      });
      expect(result.attachments).toHaveLength(2);
      expect(result.attachments[0].fileUrl).toBe('/uploads/abc123.jpg');
    });

    it('should create a private post', async () => {
      const userId = 'user-1';
      const data = {
        content: 'Private post',
        visibility: 'private'
      };

      const mockCreate = vi.fn().mockResolvedValue({
        id: 'post-1',
        content: 'Private post',
        visibility: 'private',
        authorId: userId,
        author: { id: userId, firstName: 'John', lastName: 'Doe' },
        attachments: []
      });

      prisma.post = { create: mockCreate };

      const result = await postsService.createPost(userId, data);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: 'private'
          })
        })
      );
      expect(result.visibility).toBe('private');
    });
  });

  describe('getFeedPosts', () => {
    it('should return public posts and user private posts', async () => {
      const userId = 'user-1';
      const mockPosts = [
        {
          id: 'post-1',
          content: 'Public post',
          visibility: 'public',
          authorId: 'user-2',
          attachments: [],
          _count: { comments: 2, likes: 3 },
          comments: []
        },
        {
          id: 'post-2',
          content: 'My private post',
          visibility: 'private',
          authorId: userId,
          attachments: [],
          _count: { comments: 1, likes: 1 },
          comments: []
        }
      ];

      const mockFindMany = vi.fn().mockResolvedValue(mockPosts);
      const mockCount = vi.fn().mockResolvedValue(mockPosts.length);
      const mockLikeFindMany = vi.fn().mockResolvedValue([{ postId: 'post-1' }]);
      const mockQueryRaw = vi.fn().mockResolvedValue([
        { postId: 'post-1', userId: 'user-9', firstName: 'Jane', lastName: 'Doe', row_num: 1 },
        { postId: 'post-2', userId: 'user-8', firstName: 'Alex', lastName: 'Smith', row_num: 1 }
      ]);

      prisma.post = { findMany: mockFindMany, count: mockCount };
      prisma.like = { findMany: mockLikeFindMany };
      prisma.$queryRaw = mockQueryRaw;

      const result = await postsService.getFeedPosts(userId, 1, 20);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { visibility: 'public' },
            { visibility: 'private', authorId: userId }
          ]
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          attachments: true,
          _count: { select: { comments: true, likes: true } },
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
      expect(mockLikeFindMany).toHaveBeenCalledWith({
        where: {
          userId,
          postId: { in: ['post-1', 'post-2'] }
        },
        select: { postId: true }
      });
      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        posts: [
          expect.objectContaining({
            id: 'post-1',
            isLiked: true,
            likesCount: 3,
            likedBy: [{ id: 'user-9', name: 'Jane Doe' }]
          }),
          expect.objectContaining({
            id: 'post-2',
            isLiked: false,
            likesCount: 1,
            likedBy: [{ id: 'user-8', name: 'Alex Smith' }]
          })
        ],
        hasMore: false
      });
    });

    it('should apply pagination', async () => {
      const userId = 'user-1';
      const mockFindMany = vi.fn().mockResolvedValue([]);
      const mockCount = vi.fn().mockResolvedValue(0);

      prisma.post = { findMany: mockFindMany, count: mockCount };
      prisma.like = { findMany: vi.fn() };
      prisma.$queryRaw = vi.fn();

      await postsService.getFeedPosts(userId, 2, 10);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10
        })
      );
      expect(prisma.like.findMany).not.toHaveBeenCalled();
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('getPostById', () => {
    it('should return a post by id with author and attachments', async () => {
      const postId = 'post-1';
      const mockPost = {
        id: postId,
        content: 'Test post',
        author: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
        attachments: [{ id: 'att-1', fileUrl: 'abc123.jpg', fileType: 'image/jpeg' }]
      };

      const mockFindUnique = vi.fn().mockResolvedValue(mockPost);
      prisma.post = { findUnique: mockFindUnique };

      const result = await postsService.getPostById(postId);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: postId },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          attachments: true
        }
      });
      expect(result.id).toBe(postId);
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].fileUrl).toBe('/uploads/abc123.jpg');
    });

    it('should return null for non-existent post', async () => {
      const mockFindUnique = vi.fn().mockResolvedValue(null);
      prisma.post = { findUnique: mockFindUnique };

      const result = await postsService.getPostById('non-existent');

      expect(result).toBeNull();
    });
  });
});
