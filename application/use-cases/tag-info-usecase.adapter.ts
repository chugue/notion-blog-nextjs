import { TagFilterItem } from '@/domain/entities/post.entity';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { TagInfoUsecasePort } from '@/presentation/ports/tag-info-usecase.port';
import { diContainer } from '@/shared/di/di-container';
import { allPostMetadatasDataCache } from '../data-cache/post.data-cache';
import { PostRepositoryPort } from '../port/post-repository.port';

export const createTagInfoUseCaseAdapter = (
  postRepositoryPort: PostRepositoryPort
): TagInfoUsecasePort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await allPostMetadatasDataCache(postRepositoryPort);

      if (!result.success) return [];

      return toTagFilterItem(result.data);
    },
    updateAllTagCount: async (): Promise<void> => {
      const result = await allPostMetadatasDataCache(postRepositoryPort);

      if (!result.success) return;

      const tagInfoRepository = diContainer.tagInfo.tagInfoRepository;
    },
  };
};
