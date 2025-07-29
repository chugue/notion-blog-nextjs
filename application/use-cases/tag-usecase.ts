import { TagFilterItem } from '@/domain/entities/blog.entity';
import { TagInfoRepository } from '@/infrastructure/repositories/tag-info.repository';

export interface TagInfoUseCase {
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}

export const createTagInfoUseCaseImpl = (tagInfoRepository: TagInfoRepository): TagInfoUseCase => {
  return {
    getAllTags: async () => await tagInfoRepository.getAllTags(),
  };
};
