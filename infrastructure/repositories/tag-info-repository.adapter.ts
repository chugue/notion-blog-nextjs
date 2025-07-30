import { TagFilterItem } from '@/domain/entities/blog.entity';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { toTagFilterItem } from '@/domain/utils/tag.utils';
import { tagInfoQuery } from '../queries/tag-info.query';
import { Result } from '@/shared/types/result';

export const createTagInfoRepositoryAdapter = (
  postRepositoryPort: PostRepositoryPort
): TagInfoRepositoryPort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await postRepositoryPort.getPublishedPosts({});

      if (!result.success) return [];

      const { posts } = result.data;
      const tagFilterItems = toTagFilterItem(posts);

      return tagFilterItems;
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
