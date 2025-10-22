import { TagInfo } from '@/domain/entities/tag-info.entity';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tagInfo = pgTable(
  'tag_info',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    count: integer('count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    tagInfoIdIdx: index('tag_info_id_idx').on(table.id),
    nameIdx: index('tag_info_name_idx').on(table.name),
  })
);

export type TagInfoSelect = typeof tagInfo.$inferSelect;
export type TagInfoInsert = typeof tagInfo.$inferInsert;

export const tagInfoToDomain = (data: TagInfoSelect): TagInfo => {
  return {
    id: data.id,
    name: data.name,
    count: data.count ?? 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const tagInfoToRecord = (data: TagInfo): Omit<TagInfoInsert, 'id'> => {
  return {
    name: data.name,
    count: data.count,
  };
};
