import { describe, it, expect, beforeEach, vi } from 'vitest';
import LikesService from '../../src/features/likes/likes.service.js';

describe('LikesService', () => {
  let prisma;
  let likesService;

  beforeEach(() => {
    prisma = {
      like: {
        findUnique: vi.fn(),
        delete: vi.fn(),
        create: vi.fn()
      }
    };
    likesService = new LikesService(prisma);
  });

  describe('toggleLike', () => {
    it('should like a post when not already liked', async () => {
      const userId = 'user-1';
      const entityId = 'post-1';
      const entityType = 'post';

      prisma.like.findUnique.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({
        id: 'like-1',
        userId,
        entityId,
        entityType
      });

      const result = await likesService.toggleLike(userId, entityId, entityType);

      expect(result.action).toBe('liked');
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { userId, entityId, entityType }
      });
    });

    it('should unlike a post when already liked', async () => {
      const userId = 'user-1';
      const entityId = 'post-1';
      const entityType = 'post';

      prisma.like.findUnique.mockResolvedValue({
        id: 'like-1',
        userId,
        entityId,
        entityType
      });
      prisma.like.delete.mockResolvedValue({});

      const result = await likesService.toggleLike(userId, entityId, entityType);

      expect(result.action).toBe('unliked');
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { id: 'like-1' }
      });
    });

    it('should toggle like for comments', async () => {
      const userId = 'user-1';
      const entityId = 'comment-1';
      const entityType = 'comment';

      prisma.like.findUnique.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({
        id: 'like-1',
        userId,
        entityId,
        entityType
      });

      const result = await likesService.toggleLike(userId, entityId, entityType);

      expect(result.action).toBe('liked');
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { userId, entityId, entityType }
      });
    });
  });
});
