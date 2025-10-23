import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { TagFilterItem } from '@/domain/entities/post.entity';
import { toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { Result } from '@/shared/types/result';
import { unstable_cache } from 'next/cache';
import { db } from '../database/drizzle/drizzle';
import { tagFilterItemToDomain } from '../database/supabase/schema/tag-filter-item';
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

    getAllTagInfosViaSupabase: async (): Promise<Result<TagFilterItem[], Error>> => {
      const cachedFn = unstable_cache(
        async () => {
          return await tagFilterItemQuery.getAllTagInfosViaSupabase();
        },
        ['getAllTagInfosViaSupabase'],
        { tags: ['getAllTagInfosViaSupabase'], revalidate: 5 }
      );

      const result = await cachedFn();

      if (!result.success) return { success: false, error: result.error };

      const tagFilterItems: TagFilterItem[] = result.data.map((tagFilterItem) =>
        tagFilterItemToDomain(tagFilterItem)
      );
      return { success: true, data: tagFilterItems };
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
