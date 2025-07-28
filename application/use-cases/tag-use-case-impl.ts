import { TagInfoUseCase } from '@/presentation/use-case/tag-use-case';
import { TagInfoRepository } from '../repositories/tag-repository';

export const createTagUseCaseImpl = (tagRepository: TagInfoRepository): TagInfoUseCase => ({
  getAllTags: async () => {
    return [];
  },
});
