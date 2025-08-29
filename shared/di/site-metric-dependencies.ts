import { SiteMetricsRepositoryPort } from '@/application/port/site-metrics-repository.port';
import createSiteMetricUsecaseAdapter from '@/application/use-cases/site-metric-usecase.adapter';
import createSiteMetricRepositoryAdapter from '@/infrastructure/repositories/site-metrics-repository.adapter';
import { SiteMetricsUsecasePort } from '@/presentation/ports/site-metrics-usecase.port';

export interface SiteMetricDependencies {
  siteMetricUsecase: SiteMetricsUsecasePort;
  siteMetricRepository: SiteMetricsRepositoryPort;
}

export const createSiteMetricDependencies = (): SiteMetricDependencies => {
  const siteMetricRepository = createSiteMetricRepositoryAdapter();
  const siteMetricUsecase = createSiteMetricUsecaseAdapter(siteMetricRepository);

  return {
    siteMetricRepository,
    siteMetricUsecase,
  };
};
