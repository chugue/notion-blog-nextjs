import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// 페이지별 조회수 추적
export const pageViews = pgTable(
  'page_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    notionPageId: text('notion_page_id').notNull().unique(),
    pathname: text('pathname').notNull(), // /blog/[id] 형태
    viewCount: integer('view_count').default(0), // 조회수
    likeCount: integer('like_count').default(0), // 좋아요 수
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    notionPageIdIdx: index('page_views_notion_page_id_idx').on(table.notionPageId),
    pathnameIdx: index('page_views_pathname_idx').on(table.pathname),
    createdAtIdx: index('page_views_created_at_idx').on(table.createdAt),
  })
);

export type PageViewSelect = typeof pageViews.$inferSelect;
export type PageViewInsert = typeof pageViews.$inferInsert;
