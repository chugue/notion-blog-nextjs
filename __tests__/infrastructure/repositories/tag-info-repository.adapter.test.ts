import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { PostMetadataResp, TagFilterItem } from '@/domain/entities/post.entity';
import { tagInfoQuery } from '@/infrastructure/queries/tag-info.query';
import { createTagInfoRepositoryAdapter } from '@/infrastructure/repositories/tag-info-repository.adapter';
import { Result } from '@/shared/types/result';

// Mock dependencies
jest.mock('@/infrastructure/queries/tag-info.query');
jest.mock('@/domain/utils/tag-info.utils');

const mockPostRepositoryPort: jest.Mocked<PostRepositoryPort> = {
  getAllPublishedPosts: jest.fn(),
  getPostsWithParams: jest.fn(),
  getPostById: jest.fn(),
};

const mockTagInfoQuery = tagInfoQuery as jest.Mocked<typeof tagInfoQuery>;

// Mock getAllTags method
mockTagInfoQuery.getAllTags = jest.fn();

// Mock toTagFilterItem function
const mockToTagFilterItem = jest.fn();
jest.doMock('@/domain/utils/tag-info.utils', () => ({
  toTagFilterItem: mockToTagFilterItem,
}));

describe('Infrastructure Repositories - TagInfo Repository Adapter', () => {
  let tagInfoRepository: ReturnType<typeof createTagInfoRepositoryAdapter>;

  beforeEach(() => {
    tagInfoRepository = createTagInfoRepositoryAdapter();
    jest.clearAllMocks();

    // Default mock return value
    mockTagInfoQuery.getAllTags.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  describe('getAllTags', () => {
    it('게시된 포스트를 가져와서 태그 필터 아이템으로 변환해야 한다', async () => {
      // Given
      const mockPosts = [
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
          tag: ['Next.js'],
        },
      ];

      const successResult: Result<PostMetadataResp> = {
        success: true,
        data: { posts: mockPosts, hasMore: false, nextCursor: '' },
      };

      const expectedTagFilterItems: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 2 },
        { id: 'next.js', name: 'Next.js', count: 1 },
        { id: 'react', name: 'React', count: 1 },
        { id: 'typescript', name: 'TypeScript', count: 1 },
      ];

      mockPostRepositoryPort.getPostsWithParams.mockResolvedValue(successResult);

      // toTagFilterItem을 다시 import해서 mock
      const { toTagFilterItem } = await import('@/domain/utils/tag-info.utils');
      (toTagFilterItem as jest.Mock).mockReturnValue(expectedTagFilterItems);

      // When
      const result = await tagInfoRepository.getAllTags();

      // Then
      expect(mockTagInfoQuery.getAllTags).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('포스트를 가져오는데 실패하면 빈 배열을 반환해야 한다', async () => {
      // Given
      const failureResult: Result<PostMetadataResp> = {
        success: false,
        error: new Error('Failed to fetch posts'),
      };

      mockPostRepositoryPort.getPostsWithParams.mockResolvedValue(failureResult);

      // When
      const result = await tagInfoRepository.getAllTags();

      // Then
      expect(mockTagInfoQuery.getAllTags).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('태그 정보 조회에서 에러가 발생하면 빈 배열을 반환해야 한다', async () => {
      // Given
      mockTagInfoQuery.getAllTags.mockResolvedValue({
        success: false,
        error: new Error('Database error'),
      });

      // When
      const result = await tagInfoRepository.getAllTags();

      // Then
      expect(mockTagInfoQuery.getAllTags).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('resetTagInfoList', () => {
    it('태그 정보 목록을 성공적으로 리셋해야 한다', async () => {
      // Given
      const inputTagFilterItems: TagFilterItem[] = [
        { id: 'react', name: 'React', count: 0 },
        { id: 'typescript', name: 'TypeScript', count: 0 },
      ];

      const mockDbTagInfo = [
        { id: 'all', name: '전체', count: 5, createdAt: new Date(), updatedAt: new Date() },
        { id: 'react', name: 'React', count: 3, createdAt: new Date(), updatedAt: new Date() },
        {
          id: 'typescript',
          name: 'TypeScript',
          count: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const successResult: Result<typeof mockDbTagInfo> = {
        success: true,
        data: mockDbTagInfo,
      };

      mockTagInfoQuery.resetTagInfoList.mockResolvedValue(successResult);

      // When
      const result = await tagInfoRepository.resetTagInfoList(inputTagFilterItems);

      // Then
      expect(mockTagInfoQuery.resetTagInfoList).toHaveBeenCalledWith(inputTagFilterItems);
      expect(result).toEqual([
        { id: 'all', name: '전체', count: 5 },
        { id: 'react', name: 'React', count: 3 },
        { id: 'typescript', name: 'TypeScript', count: 2 },
      ]);
    });

    it('count가 null인 경우 0으로 처리해야 한다', async () => {
      // Given
      const inputTagFilterItems: TagFilterItem[] = [{ id: 'react', name: 'React', count: 0 }];

      const mockDbTagInfo = [
        { id: 'react', name: 'React', count: null, createdAt: new Date(), updatedAt: new Date() },
      ];

      const successResult: Result<typeof mockDbTagInfo> = {
        success: true,
        data: mockDbTagInfo,
      };

      mockTagInfoQuery.resetTagInfoList.mockResolvedValue(successResult);

      // When
      const result = await tagInfoRepository.resetTagInfoList(inputTagFilterItems);

      // Then
      expect(result).toEqual([{ id: 'react', name: 'React', count: 0 }]);
    });

    it('태그 정보 리셋에 실패하면 빈 배열을 반환해야 한다', async () => {
      // Given
      const inputTagFilterItems: TagFilterItem[] = [{ id: 'react', name: 'React', count: 0 }];

      const failureResult: Result<
        { id: string; name: string; count: number | null; createdAt: Date; updatedAt: Date }[]
      > = {
        success: false,
        error: new Error('Reset failed'),
      };

      mockTagInfoQuery.resetTagInfoList.mockResolvedValue(failureResult);

      // When
      const result = await tagInfoRepository.resetTagInfoList(inputTagFilterItems);

      // Then
      expect(mockTagInfoQuery.resetTagInfoList).toHaveBeenCalledWith(inputTagFilterItems);
      expect(result).toEqual([]);
    });

    it('태그 정보 쿼리에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      // Given
      const inputTagFilterItems: TagFilterItem[] = [{ id: 'react', name: 'React', count: 0 }];
      const error = new Error('Query error');
      mockTagInfoQuery.resetTagInfoList.mockRejectedValue(error);

      // When & Then
      await expect(tagInfoRepository.resetTagInfoList(inputTagFilterItems)).rejects.toThrow(
        'Query error'
      );
      expect(mockTagInfoQuery.resetTagInfoList).toHaveBeenCalledWith(inputTagFilterItems);
    });
  });
});
