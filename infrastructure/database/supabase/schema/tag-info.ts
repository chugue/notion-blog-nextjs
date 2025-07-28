import { TagInfo } from '@/domain/entities/tag';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tagInfo = pgTable(
  'tag_info',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    count: integer('count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('tag_info_name_idx').on(table.name),
    createdAtIdx: index('tag_info_created_at_idx').on(table.createdAt),
  })
);

export type TagInfoSelect = typeof tagInfo.$inferSelect;
export type TagInfoInsert = typeof tagInfo.$inferInsert;

export const toDomain = (record: TagInfoSelect): TagInfo => ({
  id: record.id,
  name: record.name,
  count: record.count ?? 0,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const toRecord = (tagInfo: TagInfo): Omit<TagInfoInsert, 'id'> => ({
  name: tagInfo.name,
  count: tagInfo.count,
});
