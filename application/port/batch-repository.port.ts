import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { Result } from '@/shared/types/result';

export interface BatchRepositoryPort {
  readonly getSiteMetricsByDate: (
    date: Date,
    tx: Transaction
  ) => Promise<Result<SiteMetric, Error>>;
  readonly createTodayMetrics: (
    yesterdayMetrics: SiteMetric,
    todayKST: Date,
    tx: Transaction
  ) => Promise<Result<SiteMetric, Error>>;
}
