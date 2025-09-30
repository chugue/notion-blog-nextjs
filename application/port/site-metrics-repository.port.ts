import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { Result } from '@/shared/types/result';

export interface SiteMetricsRepositoryPort {
  readonly getSiteMetricsByDateRange: (
    startDate: string,
    endDate: string
  ) => Promise<Result<SiteMetric[], Error>>;
  readonly updateSiteMetric: (
    todayKST: Date,
    sameDayVisitor: VisitorInfo,
    tx: Transaction
  ) => Promise<Result<SiteMetric, Error>>;
}
