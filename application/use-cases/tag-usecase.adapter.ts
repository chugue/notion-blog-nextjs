import { TagInfoUsecasePort } from '@/presentation/ports/tag-usecase.port';
import { TagInfoRepositoryPort } from '../port/tag-info-repository.port';

export const createTagInfoUseCaseAdapter = (
  tagInfoRepository: TagInfoRepositoryPort
): TagInfoUsecasePort => {
  return {
    getAllTags: async () => await tagInfoRepository.getAllTags(),
    resetTagInfo: async () => await tagInfoRepository.resetTagInfo(),
  };
};
