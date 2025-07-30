import { createTagInfoUseCaseAdapter } from '@/application/use-cases/tag-info-usecase.adapter';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { TagFilterItem } from '@/domain/entities/blog.entity';

// Mock Repository Port
const mockTagInfoRepositoryPort: jest.Mocked<TagInfoRepositoryPort> = {
  getAllTags: jest.fn(),
  resetTagInfoList: jest.fn(),
};

describe('Application Use Cases - TagInfo UseCase Adapter', () => {
  let tagInfoUseCase: ReturnType<typeof createTagInfoUseCaseAdapter>;

  beforeEach(() => {
    tagInfoUseCase = createTagInfoUseCaseAdapter(mockTagInfoRepositoryPort);
    jest.clearAllMocks();
  });

  describe('getAllTags', () => {
    it('저장소에서 모든 태그를 가져와야 한다', async () => {
      // Given
      const mockTags: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 10 },
        { id: 'react', name: 'React', count: 5 },
        { id: 'typescript', name: 'TypeScript', count: 3 },
      ];
      mockTagInfoRepositoryPort.getAllTags.mockResolvedValue(mockTags);

      // When
      const result = await tagInfoUseCase.getAllTags();

      // Then
      expect(mockTagInfoRepositoryPort.getAllTags).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTags);
    });

    it('저장소에서 빈 배열을 반환하면 빈 배열을 반환해야 한다', async () => {
      // Given
      mockTagInfoRepositoryPort.getAllTags.mockResolvedValue([]);

      // When
      const result = await tagInfoUseCase.getAllTags();

      // Then
      expect(mockTagInfoRepositoryPort.getAllTags).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('저장소에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      // Given
      const error = new Error('Repository error');
      mockTagInfoRepositoryPort.getAllTags.mockRejectedValue(error);

      // When & Then
      await expect(tagInfoUseCase.getAllTags()).rejects.toThrow('Repository error');
      expect(mockTagInfoRepositoryPort.getAllTags).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetTagInfoList', () => {
    it('태그 정보 목록을 리셋하고 결과를 반환해야 한다', async () => {
      // Given
      const inputTags: TagFilterItem[] = [
        { id: 'react', name: 'React', count: 0 },
        { id: 'typescript', name: 'TypeScript', count: 0 },
      ];
      const expectedTags: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 5 },
        { id: 'react', name: 'React', count: 3 },
        { id: 'typescript', name: 'TypeScript', count: 2 },
      ];
      mockTagInfoRepositoryPort.resetTagInfoList.mockResolvedValue(expectedTags);

      // When
      const result = await tagInfoUseCase.resetTagInfoList(inputTags);

      // Then
      expect(mockTagInfoRepositoryPort.resetTagInfoList).toHaveBeenCalledTimes(1);
      expect(mockTagInfoRepositoryPort.resetTagInfoList).toHaveBeenCalledWith(inputTags);
      expect(result).toEqual(expectedTags);
    });

    it('빈 배열로 리셋할 수 있어야 한다', async () => {
      // Given
      const inputTags: TagFilterItem[] = [];
      const expectedTags: TagFilterItem[] = [{ id: 'all', name: '전체', count: 0 }];
      mockTagInfoRepositoryPort.resetTagInfoList.mockResolvedValue(expectedTags);

      // When
      const result = await tagInfoUseCase.resetTagInfoList(inputTags);

      // Then
      expect(mockTagInfoRepositoryPort.resetTagInfoList).toHaveBeenCalledWith(inputTags);
      expect(result).toEqual(expectedTags);
    });

    it('저장소에서 에러가 발생하면 에러를 전파해야 한다', async () => {
      // Given
      const inputTags: TagFilterItem[] = [{ id: 'react', name: 'React', count: 0 }];
      const error = new Error('Reset failed');
      mockTagInfoRepositoryPort.resetTagInfoList.mockRejectedValue(error);

      // When & Then
      await expect(tagInfoUseCase.resetTagInfoList(inputTags)).rejects.toThrow('Reset failed');
      expect(mockTagInfoRepositoryPort.resetTagInfoList).toHaveBeenCalledWith(inputTags);
    });
  });
});
