import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { SiteMetricsRepositoryPort } from '@/application/port/site-metrics-repository.port';
import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { Result } from '@/shared/types/result';
import { dateToKoreaDateString } from '@/shared/utils/format-date';
import { Transaction } from '../database/drizzle/drizzle';
import { siteMetricsQuery } from './../queries/site-metrics.query';

const createSiteMetricRepositoryAdapter = (
  pageViewRepo: PageViewRepositoryPort
): SiteMetricsRepositoryPort => {
  return {
    updateSiteMetric: async (date: string, tx: Transaction): Promise<Result<SiteMetric, Error>> => {
      try {
        const todayKST = dateToKoreaDateString(new Date(date));

        // 1. 오늘 날짜 데이터 조회
        const todayMetrics = await siteMetricsQuery.getSiteMetricsByDate(todayKST, tx);

        if (!todayMetrics) {
          // 2. 오늘 날짜 데이터가 없으면 어제 날짜 데이터 조회
          const yesterday = dateToKoreaDateString(
            new Date(new Date().setDate(new Date().getDate() - 1))
          );

          const yesterdayMetrics = await siteMetricsQuery.getSiteMetricsByDate(yesterday, tx);

          // 3. 어제 날짜 데이터가 없으면 페이지 전체 조회후 SiteMetric 생성
          if (!yesterdayMetrics) {
            const pageViews = await pageViewRepo.getAllPageViews(tx);

            if (!pageViews.success) return { success: false, error: pageViews.error };

            const totalVisits = pageViews.data.reduce((acc, curr) => acc + curr.viewCount, 0);
            const newSiteMetrics = await siteMetricsQuery.createSiteMetrics(todayKST, totalVisits);

            if (!newSiteMetrics)
              return { success: false, error: new Error('Failed to create site metrics') };

            return { success: true, data: newSiteMetrics };
          }
        }

        const result = await siteMetricsQuery.updateMetrics(todayMetrics as SiteMetric);

        if (!result) return { success: false, error: new Error('Failed to update site metrics') };

        return { success: true, data: result };
      } catch (error) {
        console.log(error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }
    },
  };
};

export default createSiteMetricRepositoryAdapter;
