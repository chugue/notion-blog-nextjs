import { jest } from '@jest/globals';
import { createTagInfoUseCaseAdapter } from '@/application/use-cases/tag-info-usecase.adapter';
import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { PostMetadata, TagFilterItem } from '@/domain/entities/post.entity';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';

// Mock Repository Ports
const mockPostRepositoryPort: jest.Mocked<PostRepositoryPort> = {
  getPostPropertiesById: jest.fn<PostRepositoryPort['getPostPropertiesById']>(),
  getAllPublishedPosts: jest.fn<PostRepositoryPort['getAllPublishedPosts']>(),
  getPostsWithParams: jest.fn<PostRepositoryPort['getPostsWithParams']>(),
  getPostById: jest.fn<PostRepositoryPort['getPostById']>(),
  getAboutPage: jest.fn<PostRepositoryPort['getAboutPage']>(),
};

const mockTagInfoRepositoryPort: jest.Mocked<TagInfoRepositoryPort> = {
  getAllTagInfosViaSupabase: jest.fn<TagInfoRepositoryPort['getAllTagInfosViaSupabase']>(),
  replaceAllTagFilterItems: jest.fn<TagInfoRepositoryPort['replaceAllTagFilterItems']>(),
  getAllTags: jest.fn<TagInfoRepositoryPort['getAllTags']>(),
};

describe('Application Use Cases - TagInfo UseCase Adapter', () => {
  let tagInfoUseCase: ReturnType<typeof createTagInfoUseCaseAdapter>;

  beforeEach(() => {
    tagInfoUseCase = createTagInfoUseCaseAdapter(mockPostRepositoryPort, mockTagInfoRepositoryPort);
    jest.clearAllMocks();
  });

  describe('getAllTags', () => {
    it('저장소(Supabase)에서 모든 태그를 가져와야 한다', async () => {
      // Given
      const mockTags: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 10 },
        { id: 'react', name: 'React', count: 5 },
        { id: 'typescript', name: 'TypeScript', count: 3 },
      ];
      mockTagInfoRepositoryPort.getAllTagInfosViaSupabase.mockResolvedValue({
        success: true,
        data: mockTags,
      });

      // When
      const result = await tagInfoUseCase.getAllTags();

      // Then
      expect(mockTagInfoRepositoryPort.getAllTagInfosViaSupabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTags);
    });

    it('저장소에서 빈 배열을 반환하면 빈 배열을 반환해야 한다', async () => {
      // Given
      mockTagInfoRepositoryPort.getAllTagInfosViaSupabase.mockResolvedValue({
        success: true,
        data: [],
      });

      // When
      const result = await tagInfoUseCase.getAllTags();

      // Then
      expect(mockTagInfoRepositoryPort.getAllTagInfosViaSupabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('저장소 조회가 실패하면 빈 배열을 반환해야 한다', async () => {
      // Given
      mockTagInfoRepositoryPort.getAllTagInfosViaSupabase.mockResolvedValue({
        success: false,
        error: new Error('Repository error'),
      });

      // When
      const result = await tagInfoUseCase.getAllTags();

      // Then
      expect(mockTagInfoRepositoryPort.getAllTagInfosViaSupabase).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('updateAllTagCount', () => {
    const mockPosts: PostMetadata[] = [
      { id: 'p1', title: 'Post 1', author: 'Stephen', date: '2024-01-01', tag: ['react'] },
      { id: 'p2', title: 'Post 2', author: 'Stephen', date: '2024-01-02', tag: ['react', 'typescript'] },
    ];

    it('발행된 포스트로 태그 카운트를 계산해 저장소를 교체하고 성공을 반환해야 한다', async () => {
      // Given
      mockPostRepositoryPort.getAllPublishedPosts.mockResolvedValue({
        success: true,
        data: mockPosts,
      });
      mockTagInfoRepositoryPort.replaceAllTagFilterItems.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // When
      const result = await tagInfoUseCase.updateAllTagCount();

      // Then
      expect(mockPostRepositoryPort.getAllPublishedPosts).toHaveBeenCalledTimes(1);
      expect(mockTagInfoRepositoryPort.replaceAllTagFilterItems).toHaveBeenCalledTimes(1);
      expect(mockTagInfoRepositoryPort.replaceAllTagFilterItems).toHaveBeenCalledWith(
        toTagFilterItem(mockPosts)
      );
      expect(result).toEqual({ success: true, data: undefined });
    });

    it('포스트가 없으면 전체 태그(count 0)만으로 저장소를 교체해야 한다', async () => {
      // Given
      mockPostRepositoryPort.getAllPublishedPosts.mockResolvedValue({
        success: true,
        data: [],
      });
      mockTagInfoRepositoryPort.replaceAllTagFilterItems.mockResolvedValue({
        success: true,
        data: undefined,
      });

      // When
      const result = await tagInfoUseCase.updateAllTagCount();

      // Then
      expect(mockTagInfoRepositoryPort.replaceAllTagFilterItems).toHaveBeenCalledWith([
        { id: 'all', name: '전체', count: 0 },
      ]);
      expect(result).toEqual({ success: true, data: undefined });
    });

    it('포스트 조회가 실패하면 에러를 반환하고 저장소를 교체하지 않아야 한다', async () => {
      // Given
      const error = new Error('Post fetch failed');
      mockPostRepositoryPort.getAllPublishedPosts.mockResolvedValue({
        success: false,
        error,
      });

      // When
      const result = await tagInfoUseCase.updateAllTagCount();

      // Then
      expect(mockTagInfoRepositoryPort.replaceAllTagFilterItems).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, error });
    });

    it('저장소 교체가 실패하면 에러를 반환해야 한다', async () => {
      // Given
      const error = new Error('Replace failed');
      mockPostRepositoryPort.getAllPublishedPosts.mockResolvedValue({
        success: true,
        data: mockPosts,
      });
      mockTagInfoRepositoryPort.replaceAllTagFilterItems.mockResolvedValue({
        success: false,
        error,
      });

      // When
      const result = await tagInfoUseCase.updateAllTagCount();

      // Then
      expect(mockTagInfoRepositoryPort.replaceAllTagFilterItems).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: false, error });
    });
  });
});
