import { TagFilterItem } from '@/domain/entities/post.entity';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { tagInfoToDomain, toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { tagInfoQuery } from '../queries/tag-info.query';
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

    resetTagInfoList: async (tagFilterItems: TagFilterItem[]): Promise<TagFilterItem[]> => {
      const result = await tagInfoQuery.resetTagInfoList(tagFilterItems);

      if (!result.success) return [];

      return result.data.map((tagInfo) => ({
        id: tagInfo.id,
        name: tagInfo.name,
        count: tagInfo.count ?? 0,
      })) as TagFilterItem[];
    },
  };
};
