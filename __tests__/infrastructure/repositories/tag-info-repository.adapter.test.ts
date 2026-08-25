import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { PostMetadata, TagFilterItem } from '@/domain/entities/post.entity';
import type { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { TagFilterItemSelect } from '@/infrastructure/database/supabase/schema/tag-filter-item';
import { Result } from '@/shared/types/result';
import { jest } from '@jest/globals';

// Mock dependencies (ESM 환경이므로 unstable_mockModule + 동적 import 사용)
const mockGetAllTagInfosViaSupabase = jest.fn<() => Promise<Result<TagFilterItemSelect[]>>>();
const mockDeleteAllTagFilterItems = jest.fn<(tx?: Transaction) => Promise<void>>();
const mockInsertTagFilterItems =
  jest.fn<(tagFilterItems: TagFilterItem[], tx?: Transaction) => Promise<void>>();

jest.unstable_mockModule('@/infrastructure/queries/tag-filter-item.query', () => ({
  tagFilterItemQuery: {
    getAllTagInfosViaSupabase: mockGetAllTagInfosViaSupabase,
    deleteAllTagFilterItems: mockDeleteAllTagFilterItems,
    insertTagFilterItems: mockInsertTagFilterItems,
  },
}));

const mockTx = { delete: jest.fn(), insert: jest.fn() } as unknown as Transaction;
const mockTransaction = jest.fn(async (callback: (tx: Transaction) => Promise<void>) => {
  await callback(mockTx);
});

jest.unstable_mockModule('@/infrastructure/database/drizzle/drizzle', () => ({
  db: { transaction: mockTransaction },
}));

jest.unstable_mockModule('next/cache', () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  revalidateTag: jest.fn(),
}));

const { createTagInfoRepositoryAdapter } = await import(
  '@/infrastructure/repositories/tag-info-repository.adapter'
);

const mockPostRepositoryPort: jest.Mocked<PostRepositoryPort> = {
  getPostPropertiesById: jest.fn<PostRepositoryPort['getPostPropertiesById']>(),
  getAllPublishedPosts: jest.fn<PostRepositoryPort['getAllPublishedPosts']>(),
  getPostsWithParams: jest.fn<PostRepositoryPort['getPostsWithParams']>(),
  getPostById: jest.fn<PostRepositoryPort['getPostById']>(),
  getAboutPage: jest.fn<PostRepositoryPort['getAboutPage']>(),
};

describe('Infrastructure Repositories - TagInfo Repository Adapter', () => {
  let tagInfoRepository: ReturnType<typeof createTagInfoRepositoryAdapter>;

  beforeEach(() => {
    jest.clearAllMocks();
    tagInfoRepository = createTagInfoRepositoryAdapter(mockPostRepositoryPort);
  });

  describe('getAllTags', () => {
    it('게시된 포스트를 가져와서 태그 필터 아이템으로 변환해야 한다', async () => {
      // Given
      const mockPosts: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post 1',
          author: 'Author',
          date: '2024-01-01',
          tag: ['React', 'TypeScript'],
        },
        {
          id: '2',
          title: 'Test Post 2',
          author: 'Author',
          date: '2024-01-02',
          tag: ['React'],
        },
      ];

      mockPostRepositoryPort.getAllPublishedPosts.mockResolvedValue({
        success: true,
        data: mockPosts,
      });

      // When
      const result = await tagInfoRepository.getAllTags();

      // Then
      expect(mockPostRepositoryPort.getAllPublishedPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        { id: 'all', name: '전체', count: 2 },
        { id: 'React', name: 'React', count: 2 },
        { id: 'TypeScript', name: 'TypeScript', count: 1 },
      ]);
    });

    it('포스트를 가져오는데 실패하면 빈 배열을 반환해야 한다', async () => {
      // Given
      mockPostRepositoryPort.getAllPublishedPosts.mockResolvedValue({
        success: false,
        error: new Error('Failed to fetch posts'),
      });

      // When
      const result = await tagInfoRepository.getAllTags();

      // Then
      expect(mockPostRepositoryPort.getAllPublishedPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('getAllTagInfosViaSupabase', () => {
    it('DB 레코드를 도메인 TagFilterItem으로 변환해서 반환해야 한다', async () => {
      // Given
      const mockDbRows: TagFilterItemSelect[] = [
        { id: 'all', name: '전체', count: 5 },
        { id: 'react', name: 'React', count: 3 },
      ];

      mockGetAllTagInfosViaSupabase.mockResolvedValue({ success: true, data: mockDbRows });

      // When
      const result = await tagInfoRepository.getAllTagInfosViaSupabase();

      // Then
      expect(mockGetAllTagInfosViaSupabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        data: [
          { id: 'all', name: '전체', count: 5 },
          { id: 'react', name: 'React', count: 3 },
        ],
      });
    });

    it('count가 null인 경우 0으로 처리해야 한다', async () => {
      // Given
      const mockDbRows: TagFilterItemSelect[] = [{ id: 'react', name: 'React', count: null }];

      mockGetAllTagInfosViaSupabase.mockResolvedValue({ success: true, data: mockDbRows });

      // When
      const result = await tagInfoRepository.getAllTagInfosViaSupabase();

      // Then
      expect(result).toEqual({
        success: true,
        data: [{ id: 'react', name: 'React', count: 0 }],
      });
    });

    it('쿼리가 실패하면 실패 Result를 그대로 반환해야 한다', async () => {
      // Given
      const error = new Error('Database error');
      mockGetAllTagInfosViaSupabase.mockResolvedValue({ success: false, error });

      // When
      const result = await tagInfoRepository.getAllTagInfosViaSupabase();

      // Then
      expect(result).toEqual({ success: false, error });
    });
  });

  describe('replaceAllTagFilterItems', () => {
    it('트랜잭션 안에서 전체 삭제 후 삽입해야 한다', async () => {
      // Given
      const inputTagFilterItems: TagFilterItem[] = [
        { id: 'react', name: 'React', count: 3 },
        { id: 'typescript', name: 'TypeScript', count: 2 },
      ];

      mockDeleteAllTagFilterItems.mockResolvedValue(undefined);
      mockInsertTagFilterItems.mockResolvedValue(undefined);

      // When
      const result = await tagInfoRepository.replaceAllTagFilterItems(inputTagFilterItems);

      // Then
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockDeleteAllTagFilterItems).toHaveBeenCalledWith(mockTx);
      expect(mockInsertTagFilterItems).toHaveBeenCalledWith(inputTagFilterItems, mockTx);
      expect(result).toEqual({ success: true, data: undefined });
    });

    it('빈 배열이면 삭제·삽입 없이 성공해야 한다', async () => {
      // When
      const result = await tagInfoRepository.replaceAllTagFilterItems([]);

      // Then
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockDeleteAllTagFilterItems).not.toHaveBeenCalled();
      expect(mockInsertTagFilterItems).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: undefined });
    });

    it('트랜잭션이 실패하면 실패 Result를 반환해야 한다', async () => {
      // Given
      const inputTagFilterItems: TagFilterItem[] = [{ id: 'react', name: 'React', count: 3 }];
      const error = new Error('Transaction failed');
      mockDeleteAllTagFilterItems.mockRejectedValue(error);

      // When
      const result = await tagInfoRepository.replaceAllTagFilterItems(inputTagFilterItems);

      // Then
      expect(mockInsertTagFilterItems).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error });
    });
  });
});
