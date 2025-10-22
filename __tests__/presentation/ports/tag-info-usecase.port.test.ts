import { TagFilterItem } from '@/domain/entities/post.entity';
import { TagInfoUsecasePort } from '@/presentation/ports/tag-info-usecase.port';
import { Result } from '@/shared/types/result';

/**
 * TagInfoUsecasePort 계약 테스트
 *
 * 포트 인터페이스가 올바르게 정의되어 있는지 검증합니다.
 */
describe('Presentation Ports - TagInfoUsecasePort Contract', () => {
  // 간단한 mock 구현체
  const createMockUseCase = (): TagInfoUsecasePort => ({
    getAllTags: async (): Promise<TagFilterItem[]> => [],
    updateAllTagCount: async (): Promise<Result<void, Error>> => ({
      success: true,
      data: undefined,
    }),
  });

  describe('인터페이스 구조', () => {
    it('getAllTags와 updateAllTagCount 메서드를 가져야 한다', () => {
      const useCase = createMockUseCase();

      expect(useCase).toHaveProperty('getAllTags');
      expect(useCase).toHaveProperty('updateAllTagCount');
      expect(typeof useCase.getAllTags).toBe('function');
      expect(typeof useCase.updateAllTagCount).toBe('function');
    });
  });

  describe('getAllTags 메서드', () => {
    it('TagFilterItem 배열을 반환해야 한다', async () => {
      const mockTags: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 10 },
        { id: 'react', name: 'React', count: 5 },
      ];

      const useCase: TagInfoUsecasePort = {
        getAllTags: async () => mockTags,
        updateAllTagCount: async () => ({ success: true, data: undefined }),
      };

      const result = await useCase.getAllTags();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('count');
    });

    it('빈 배열을 반환할 수 있어야 한다', async () => {
      const useCase: TagInfoUsecasePort = {
        getAllTags: async () => [],
        updateAllTagCount: async () => ({ success: true, data: undefined }),
      };

      const result = await useCase.getAllTags();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('TagFilterItem은 id, name, count 속성을 가져야 한다', async () => {
      const mockTags: TagFilterItem[] = [{ id: 'test', name: 'Test', count: 1 }];

      const useCase: TagInfoUsecasePort = {
        getAllTags: async () => mockTags,
        updateAllTagCount: async () => ({ success: true, data: undefined }),
      };

      const result = await useCase.getAllTags();
      const tag = result[0];

      expect(typeof tag.id).toBe('string');
      expect(typeof tag.name).toBe('string');
      expect(typeof tag.count).toBe('number');
    });
  });

  describe('updateAllTagCount 메서드', () => {
    it('성공 시 Result<void, Error> 타입을 반환해야 한다', async () => {
      const useCase: TagInfoUsecasePort = {
        getAllTags: async () => [],
        updateAllTagCount: async () => ({
          success: true,
          data: undefined,
        }),
      };

      const result = await useCase.updateAllTagCount();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('실패 시 에러가 포함된 Result를 반환해야 한다', async () => {
      const error = new Error('Update failed');
      const useCase: TagInfoUsecasePort = {
        getAllTags: async () => [],
        updateAllTagCount: async () => ({
          success: false,
          error,
        }),
      };

      const result = await useCase.updateAllTagCount();

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
        expect(result.error.message).toBe('Update failed');
      }
    });

    it('Promise를 반환해야 한다', () => {
      const useCase = createMockUseCase();
      const result = useCase.updateAllTagCount();

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('타입 안전성', () => {
    it('포트 구현체는 readonly 속성을 준수해야 한다', () => {
      const useCase = createMockUseCase();

      // TypeScript 컴파일 타임에 체크되므로, 런타임에서는 함수 존재 여부만 확인
      expect(typeof useCase.getAllTags).toBe('function');
      expect(typeof useCase.updateAllTagCount).toBe('function');
    });

    it('getAllTags는 인자를 받지 않아야 한다', () => {
      const useCase = createMockUseCase();

      expect(useCase.getAllTags.length).toBe(0);
    });

    it('updateAllTagCount는 인자를 받지 않아야 한다', () => {
      const useCase = createMockUseCase();

      expect(useCase.updateAllTagCount.length).toBe(0);
    });
  });
});
