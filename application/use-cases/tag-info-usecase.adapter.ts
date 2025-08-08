import { TagInfoUsecasePort } from '@/presentation/ports/tag-info-usecase.port';
import { TagInfoRepositoryPort } from '../port/tag-info-repository.port';
import { TagFilterItem } from '@/domain/entities/post.entity';
import { PostRepositoryPort } from '../port/post-repository.port';
import { allPostMetadatasDataCache } from '../data-cache/post.data-cache';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';

export const createTagInfoUseCaseAdapter = (
  tagInfoRepositoryPort: TagInfoRepositoryPort,
  postRepositoryPort: PostRepositoryPort
): TagInfoUsecasePort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await allPostMetadatasDataCache(postRepositoryPort);

      if (!result.success) return [];

      return toTagFilterItem(result.data);
    },
  };
};
