import { TagFilterItem } from '@/domain/entities/post.entity';
import { db } from '../database/drizzle/drizzle';
import { tagFilterItem } from '../database/supabase/schema/tag-filter-item';

export const tagFilterItemQuery = {
  deleteAllTagFilterItems: async (): Promise<void> => {
    await db.delete(tagFilterItem).execute();
  },
  insertTagFilterItems: async (tagFilterItems: TagFilterItem[]): Promise<void> => {
    await db.insert(tagFilterItem).values(tagFilterItems).execute();
  },
};
