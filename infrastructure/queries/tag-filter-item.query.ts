import { TagFilterItem } from '@/domain/entities/post.entity';
import { Transaction, db } from '../database/drizzle/drizzle';
import { tagFilterItem } from '../database/supabase/schema/tag-filter-item';

export const tagFilterItemQuery = {
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
