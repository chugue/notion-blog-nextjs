import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { SiteMetricsUsecasePort } from '@/presentation/ports/site-metrics-usecase.port';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { dateToKoreaDateString } from '@/shared/utils/format-date';
import { uuid } from 'drizzle-orm/pg-core';
import { SiteMetricsRepositoryPort } from '../port/site-metrics-repository.port';

const createSiteMetricUsecaseAdapter = (
  siteMetricRepo: SiteMetricsRepositoryPort
): SiteMetricsUsecasePort => {
  return {
    getThirtyDaysSiteMetrics: async (): Promise<MainPageChartData[]> => {
      const todayKST = dateToKoreaDateString(new Date());
      const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 29));

      const startDate = dateToKoreaDateString(thirtyDaysAgo);
      const endDate = todayKST;

      const result = await siteMetricRepo.getSiteMetricsByDateRange(startDate, endDate);

      if (!result.success) {
        console.log(result.error);
        return [];
      }

      const dailyMetrics = result.data.map((metric: SiteMetric | null) => {
        if (!metric) {
          return {
            id: uuid().defaultRandom(),
            date: 'N/A',
            totalVisits: 0,
            dailyVisits: 0,
          };
        }
        return metric;
      });

      return dailyMetrics
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
        .map((metric) => ({
          id: metric.id,
          date: metric.date,
          daily: metric.dailyVisits,
          total: metric.totalVisits,
        })) as MainPageChartData[];
    },
  };
};

export default createSiteMetricUsecaseAdapter;
