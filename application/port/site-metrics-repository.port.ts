import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { Result } from '@/shared/types/result';

export interface SiteMetricsRepositoryPort {
  readonly updateSiteMetric: (
    todayKST: string,
    tx: Transaction
  ) => Promise<Result<SiteMetric, Error>>;
}
