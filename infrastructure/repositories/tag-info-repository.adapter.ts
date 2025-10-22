import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { TagFilterItem } from '@/domain/entities/post.entity';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { Result } from '@/shared/types/result';
import { tagFilterItemQuery } from '../queries/tag-filter-item.query';

export const createTagInfoRepositoryAdapter = (
  postRepositoryPort: PostRepositoryPort
): TagInfoRepositoryPort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await postRepositoryPort.getAllPublishedPosts();

      if (!result.success) return [];

      return toTagFilterItem(result.data);
    },
    replaceAllTagFilterItems: async (
      tagFilterItems: TagFilterItem[]
    ): Promise<Result<void, Error>> => {
      try {
        await tagFilterItemQuery.deleteAllTagFilterItems();
        if (tagFilterItems.length > 0) {
          await tagFilterItemQuery.insertTagFilterItems(tagFilterItems);
        }
        return { success: true, data: undefined };
      } catch (error) {
        console.log(error);
        return { success: false, error: error as Error };
      }
    },
  };
};
