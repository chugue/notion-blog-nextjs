import { date, index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

// 페이지별 조회수 추적
export const siteMetrics = pgTable(
  'site_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    totalVisits: integer('total_visits').default(0).notNull(),
    dailyVisits: integer('daily_visits').default(0).notNull(),
    date: date('date').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: index('site_metrics_date_idx').on(table.date),
    createdAtIdx: index('site_metrics_created_at_idx').on(table.createdAt),
  })
);

export type SiteMetricSelect = typeof siteMetrics.$inferSelect;
export type SiteMetricInsert = typeof siteMetrics.$inferInsert;
