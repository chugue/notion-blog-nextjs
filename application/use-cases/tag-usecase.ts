import { TagInfo } from '@/domain/entities/tag.entity';
import { TagInfoRepository } from '@/infrastructure/repositories/tag-info.repository';

export interface TagInfoUseCase {
  readonly getAllTags: () => Promise<TagInfo[]>;
}

export const createTagInfoUseCaseImpl = (tagInfoRepository: TagInfoRepository): TagInfoUseCase => {
  return {
    getAllTags: async () => await tagInfoRepository.getAllTags(),
  };
};
