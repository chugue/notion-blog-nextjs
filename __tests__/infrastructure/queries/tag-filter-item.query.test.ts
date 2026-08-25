// 👈 새 파일 내용: tag-filter-item.query.ts 테스트

import { TagFilterItem } from '@/domain/entities/post.entity';
import type { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { tagFilterItem } from '@/infrastructure/database/supabase/schema/tag-filter-item';
import { jest } from '@jest/globals';

// 모킹 설정 (ESM 환경이므로 unstable_mockModule + 동적 import 사용)
const mockOrderBy = jest.fn<() => Promise<TagFilterItem[]>>();
const mockFrom = jest.fn(() => ({ orderBy: mockOrderBy }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));

const mockDeleteExecute = jest.fn<() => Promise<void>>();
const mockDelete = jest.fn(() => ({ execute: mockDeleteExecute }));

const mockInsertExecute = jest.fn<() => Promise<void>>();
const mockValues = jest.fn(() => ({ execute: mockInsertExecute }));
const mockInsert = jest.fn(() => ({ values: mockValues }));

jest.unstable_mockModule('@/infrastructure/database/drizzle/drizzle', () => ({
  db: {
    select: mockSelect,
    delete: mockDelete,
    insert: mockInsert,
  },
}));

const { tagFilterItemQuery } = await import('@/infrastructure/queries/tag-filter-item.query');

describe('tagFilterItemQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteExecute.mockResolvedValue(undefined);
    mockInsertExecute.mockResolvedValue(undefined);
  });

  describe('getAllTagInfosViaSupabase', () => {
    it('should return all tag filter items ordered by count', async () => {
      const mockRows: TagFilterItem[] = [
        { id: '1', name: 'tag1', count: 5 },
        { id: '2', name: 'tag2', count: 3 },
      ];
      mockOrderBy.mockResolvedValue(mockRows);

      const result = await tagFilterItemQuery.getAllTagInfosViaSupabase();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockRows);
      }
      expect(mockSelect).toHaveBeenCalledTimes(1);
      expect(mockFrom).toHaveBeenCalledWith(tagFilterItem);
    });

    it('should return error on failure', async () => {
      const mockError = new Error('DB error');
      mockOrderBy.mockRejectedValue(mockError);

      const result = await tagFilterItemQuery.getAllTagInfosViaSupabase();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(mockError);
      }
    });
  });

  describe('deleteAllTagFilterItems', () => {
    it('should delete via db when no transaction is given', async () => {
      await tagFilterItemQuery.deleteAllTagFilterItems();

      expect(mockDelete).toHaveBeenCalledWith(tagFilterItem);
      expect(mockDeleteExecute).toHaveBeenCalledTimes(1);
    });

    it('should delete via transaction when given', async () => {
      const txDeleteExecute = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
      const txDelete = jest.fn(() => ({ execute: txDeleteExecute }));
      const tx = { delete: txDelete } as unknown as Transaction;

      await tagFilterItemQuery.deleteAllTagFilterItems(tx);

      expect(txDelete).toHaveBeenCalledWith(tagFilterItem);
      expect(txDeleteExecute).toHaveBeenCalledTimes(1);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should propagate error on failure', async () => {
      mockDeleteExecute.mockRejectedValue(new Error('DB error'));

      await expect(tagFilterItemQuery.deleteAllTagFilterItems()).rejects.toThrow('DB error');
    });
  });

  describe('insertTagFilterItems', () => {
    const mockItems: TagFilterItem[] = [
      { id: '1', name: 'tag1', count: 5 },
      { id: '2', name: 'tag2', count: 3 },
    ];

    it('should insert via db when no transaction is given', async () => {
      await tagFilterItemQuery.insertTagFilterItems(mockItems);

      expect(mockInsert).toHaveBeenCalledWith(tagFilterItem);
      expect(mockValues).toHaveBeenCalledWith(mockItems);
      expect(mockInsertExecute).toHaveBeenCalledTimes(1);
    });

    it('should insert via transaction when given', async () => {
      const txInsertExecute = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
      const txValues = jest.fn(() => ({ execute: txInsertExecute }));
      const txInsert = jest.fn(() => ({ values: txValues }));
      const tx = { insert: txInsert } as unknown as Transaction;

      await tagFilterItemQuery.insertTagFilterItems(mockItems, tx);

      expect(txInsert).toHaveBeenCalledWith(tagFilterItem);
      expect(txValues).toHaveBeenCalledWith(mockItems);
      expect(txInsertExecute).toHaveBeenCalledTimes(1);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should propagate error on failure', async () => {
      mockInsertExecute.mockRejectedValue(new Error('DB error'));

      await expect(tagFilterItemQuery.insertTagFilterItems(mockItems)).rejects.toThrow(
        'DB error'
      );
    });
  });
});
