import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { index, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

// 페이지별 조회수 추적
export const siteMetrics = pgTable(
  'site_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    totalVisits: integer('total_visits').default(0).notNull(),
    dailyVisits: integer('daily_visits').default(0).notNull(),
    date: timestamp('date').notNull().unique(),
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

export const siteMetricToDomain = (data?: SiteMetricSelect): SiteMetric => {
  if (!data) {
    return {
      id: uuid().defaultRandom().toString(),
      totalVisits: 0,
      dailyVisits: 0,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return {
    id: data.id ?? uuid().defaultRandom().toString(),
    totalVisits: data.totalVisits ?? 0,
    dailyVisits: data.dailyVisits ?? 0,
    date: data.date,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};

export const siteMetricToRecord = (data: SiteMetric): Omit<SiteMetricInsert, 'id'> => {
  return {
    totalVisits: data.totalVisits,
    dailyVisits: data.dailyVisits,
    date: data.date,
  };
};
