import { TagFilterItem } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';
import { desc } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';
import { TagFilterItemSelect, tagFilterItem } from '../database/supabase/schema/tag-filter-item';

export const tagFilterItemQuery = {
  getAllTagInfosViaSupabase: async (): Promise<Result<TagFilterItemSelect[], Error>> => {
    try {
      const result = await db.select().from(tagFilterItem).orderBy(desc(tagFilterItem.count));

      return { success: true, data: result };
    } catch (error) {
      console.log(error);
      return { success: false, error: error as Error };
    }
  },
  deleteAllTagFilterItems: async (tx?: Transaction): Promise<void> => {
    if (tx) {
      await tx.delete(tagFilterItem).execute();
    } else {
      await db.delete(tagFilterItem).execute();
    }
  },
  insertTagFilterItems: async (
    tagFilterItems: TagFilterItem[],
    tx?: Transaction
  ): Promise<void> => {
    if (tx) {
      await tx.insert(tagFilterItem).values(tagFilterItems).execute();
    } else {
      await db.insert(tagFilterItem).values(tagFilterItems).execute();
    }
  },
};
