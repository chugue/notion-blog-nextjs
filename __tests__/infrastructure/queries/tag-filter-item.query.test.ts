// 👈 새 파일 내용: tag-filter-item.query.ts 테스트

import { TagFilterItem } from '@/domain/entities/post.entity';
import { db } from '@/infrastructure/database/drizzle/drizzle';
import { tagFilterItem } from '@/infrastructure/database/supabase/schema/tag-filter-item';
import { tagFilterItemQuery } from '@/infrastructure/queries/tag-filter-item.query';
import { Result } from '@/shared/types/result';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// 모킹 설정
vi.mock('@/infrastructure/database/drizzle/drizzle', () => ({
  db: {
    delete: vi.fn().mockReturnValue({ execute: vi.fn().mockResolvedValue(undefined) }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ execute: vi.fn().mockResolvedValue(undefined) }),
    }),
  },
}));

describe('tagFilterItemQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('replaceAllTagFilterItems', () => {
    it('should successfully replace all tag filter items', async () => {
      const mockItems: TagFilterItem[] = [
        { id: '1', name: 'tag1', count: 5 },
        { id: '2', name: 'tag2', count: 3 },
      ];

      const result: Result<void, Error> =
        await tagFilterItemQuery.replaceAllTagFilterItems(mockItems);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();

      expect(db.delete).toHaveBeenCalledWith(tagFilterItem);
      expect(db.delete().execute).toHaveBeenCalled();

      expect(db.insert).toHaveBeenCalledWith(tagFilterItem);
      expect(db.insert().values).toHaveBeenCalledWith([
        { id: '1', name: 'tag1', count: 5 },
        { id: '2', name: 'tag2', count: 3 },
      ]);
      expect(db.insert().values().execute).toHaveBeenCalled();
    });

    it('should handle empty array by only deleting', async () => {
      const mockItems: TagFilterItem[] = [];

      const result = await tagFilterItemQuery.replaceAllTagFilterItems(mockItems);

      expect(result.success).toBe(true);
      expect(db.delete).toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should return error on failure', async () => {
      const mockError = new Error('DB error');
      (db.delete as any).mockReturnValue({ execute: vi.fn().mockRejectedValue(mockError) });

      const result = await tagFilterItemQuery.replaceAllTagFilterItems([]);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('DB error');
    });
  });
});
