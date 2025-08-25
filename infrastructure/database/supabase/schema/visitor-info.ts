import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const visitorInfo = pgTable(
  'visitor_info',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipHash: text('ip_hash').notNull().unique(),
    userAgent: text('user_agent').notNull(), // /blog/[id] 형태
    date: text('date').notNull(),
    visitedPathnames: text('visited_pathnames').array().notNull(), // 조회수
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ipHashIdx: index('visitor_info_ip_hash_idx').on(table.ipHash),
    userAgentIdx: index('visitor_info_user_agent_idx').on(table.userAgent),
    dateIdx: index('visitor_info_date_idx').on(table.date),
    visitedPathnamesIdx: index('visitor_info_visited_pathnames_idx').on(table.visitedPathnames),
  })
);

export type VisitorInfoSelect = typeof visitorInfo.$inferSelect;
export type VisitorInfoInsert = typeof visitorInfo.$inferInsert;
