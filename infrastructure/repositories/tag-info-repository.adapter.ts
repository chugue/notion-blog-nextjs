import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { TagFilterItem } from '@/domain/entities/post.entity';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { Result } from '@/shared/types/result';
import { db } from '../database/drizzle/drizzle';
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
        await db.transaction(async (tx) => {
          if (tagFilterItems.length > 0) {
            await tagFilterItemQuery.deleteAllTagFilterItems(tx);
            await tagFilterItemQuery.insertTagFilterItems(tagFilterItems, tx);
          }
        });
        return { success: true, data: undefined };
      } catch (error) {
        console.log(error);
        return { success: false, error: error as Error };
      }
    },
  };
};
