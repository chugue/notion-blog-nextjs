import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { Result } from '@/shared/types/result';

export interface SiteMetricsUsecasePort {
  readonly updateSiteMetrics: (siteMetrics: SiteMetric) => Promise<Result<SiteMetric, Error>>;
}
