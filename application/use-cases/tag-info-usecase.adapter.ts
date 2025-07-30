import { TagInfoUsecasePort } from '@/presentation/ports/tag-info-usecase.port';
import { TagInfoRepositoryPort } from '../port/tag-info-repository.port';
import { TagFilterItem } from '@/domain/entities/blog.entity';

export const createTagInfoUseCaseAdapter = (
  tagInfoRepositoryPort: TagInfoRepositoryPort
): TagInfoUsecasePort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await tagInfoRepositoryPort.getAllTags();

      return result;
    },
    resetTagInfoList: async (tagFilterItems: TagFilterItem[]): Promise<TagFilterItem[]> => {
      const result = await tagInfoRepositoryPort.resetTagInfoList(tagFilterItems);

      return result;
    },
  };
};
