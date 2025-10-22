import { TagFilterItem } from '@/domain/entities/post.entity';
import { index, integer, pgTable, text } from 'drizzle-orm/pg-core';

export const tagFilterItem = pgTable(
  'tag_filter_item',
  {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull().unique(),
    count: integer('count').default(0),
  },
  (table) => ({
    tagFilterItemIdx: index('tag_filter_item_name_idx').on(table.name),
  })
);

export type TagFilterItemSelect = typeof tagFilterItem.$inferSelect;

export const tagFilterItemToDomain = (data: TagFilterItemSelect): TagFilterItem => {
  return {
    id: data.id,
    name: data.name,
    count: data.count ?? 0,
  };
};
