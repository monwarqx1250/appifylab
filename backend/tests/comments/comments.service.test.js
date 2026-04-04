import { describe, it, expect, beforeEach, vi } from 'vitest';
import CommentsService from '../../src/features/comments/comments.service.js';

describe('CommentsService', () => {
  let prisma;
  let commentsService;

  beforeEach(() => {
    prisma = {
      comment: {
        create: vi.fn(),
        findMany: vi.fn()
      }
    };
    commentsService = new CommentsService(prisma);
  });

  describe('createComment', () => {
    it('should create a top-level comment', async () => {
      const userId = 'user-1';
      const data = {
        content: 'Great post!',
        postId: 'post-1'
      };

      prisma.comment.create.mockResolvedValue({
        id: 'comment-1',
        content: 'Great post!',
        postId: 'post-1',
        parentId: null,
        authorId: userId,
        author: { id: userId, firstName: 'John', lastName: 'Doe' }
      });

      const result = await commentsService.createComment(userId, data);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Great post!',
          postId: 'post-1',
          parentId: null,
          authorId: userId
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } }
        }
      });
      expect(result.content).toBe('Great post!');
      expect(result.parentId).toBeNull();
    });

    it('should create a reply to a comment', async () => {
      const userId = 'user-1';
      const data = {
        content: 'Reply to comment',
        postId: 'post-1',
        parentId: 'comment-parent-1'
      };

      prisma.comment.create.mockResolvedValue({
        id: 'comment-2',
        content: 'Reply to comment',
        postId: 'post-1',
        parentId: 'comment-parent-1',
        authorId: userId,
        author: { id: userId, firstName: 'Jane', lastName: 'Doe' }
      });

      const result = await commentsService.createComment(userId, data);

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Reply to comment',
          postId: 'post-1',
          parentId: 'comment-parent-1',
          authorId: userId
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } }
        }
      });
      expect(result.parentId).toBe('comment-parent-1');
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return comments for a post sorted by createdAt ascending', async () => {
      const postId = 'post-1';
      const mockComments = [
        { id: 'comment-1', content: 'First comment' },
        { id: 'comment-2', content: 'Second comment' }
      ];

      prisma.comment.findMany.mockResolvedValue(mockComments);

      const result = await commentsService.getCommentsByPostId(postId);

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { likes: true, replies: true } }
        }
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no comments exist', async () => {
      prisma.comment.findMany.mockResolvedValue([]);

      const result = await commentsService.getCommentsByPostId('post-with-no-comments');

      expect(result).toHaveLength(0);
    });
  });
});
