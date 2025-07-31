import { TagFilterItem } from '@/domain/entities/post.entity';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { tagInfoToDomain, toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { PostRepositoryPort } from '@/application/port/post-repository.port';

export const createTagInfoRepositoryAdapter = (
  postRepositoryPort: PostRepositoryPort
): TagInfoRepositoryPort => {
  return {
    // getAllTags: async (): Promise<TagFilterItem[]> => {
    //   const result = await tagInfoQuery.getAllTags();

    //   if (!result.success) return [];

    //   return result.data.map((tagInfo) => tagInfoToDomain(tagInfo));
    // },
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await postRepositoryPort.getAllPublishedPosts();

      if (!result.success) return [];

      return toTagFilterItem(result.data);
    },
  };
};
