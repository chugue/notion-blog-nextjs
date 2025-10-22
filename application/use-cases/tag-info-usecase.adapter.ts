import { TagFilterItem } from '@/domain/entities/post.entity';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { TagInfoUsecasePort } from '@/presentation/ports/tag-info-usecase.port';
import { Result } from '@/shared/types/result';
import { allPostMetadatasDataCache } from '../data-cache/post.data-cache';
import { PostRepositoryPort } from '../port/post-repository.port';
import { TagInfoRepositoryPort } from '../port/tag-info-repository.port';

export const createTagInfoUseCaseAdapter = (
  postRepositoryPort: PostRepositoryPort,
  tagInfoRepositoryPort: TagInfoRepositoryPort
): TagInfoUsecasePort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await allPostMetadatasDataCache(postRepositoryPort);

      if (!result.success) return [];

      return toTagFilterItem(result.data);
    },
    updateAllTagCount: async (): Promise<Result<void, Error>> => {
      // 1. 모든 PostMetadata 조회
      const postMetadataResult = await postRepositoryPort.getAllPublishedPosts();

      if (!postMetadataResult.success) return { success: false, error: postMetadataResult.error };

      // 2. tagInfo 형태로 변환
      const tagFilterItems: TagFilterItem[] = toTagFilterItem(postMetadataResult.data);

      // 3. supabase로 업데이트
      const tagInfoResult = await tagInfoRepositoryPort.replaceAllTagFilterItems(tagFilterItems);
      if (!tagInfoResult.success) return { success: false, error: tagInfoResult.error };

      return { success: true, data: undefined };
    },
  };
};
