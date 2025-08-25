import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// 페이지별 조회수 추적
export const siteMetrics = pgTable(
  'site_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    totalVisits: integer('total_visits').default(0).notNull(),
    dailyVisits: integer('daily_visits').default(0).notNull(),
    date: text('date').notNull().unique(),
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

export const siteMetricToDomain = (data: SiteMetricSelect): SiteMetric => {
  return {
    id: data.id,
    totalVisits: data.totalVisits,
    dailyVisits: data.dailyVisits,
    date: data.date,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const siteMetricToRecord = (data: SiteMetric): Omit<SiteMetricInsert, 'id'> => {
  return {
    totalVisits: data.totalVisits,
    dailyVisits: data.dailyVisits,
    date: data.date,
  };
};
