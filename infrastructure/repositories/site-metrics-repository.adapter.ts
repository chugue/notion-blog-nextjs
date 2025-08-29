import { SiteMetricsRepositoryPort } from '@/application/port/site-metrics-repository.port';
import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { Result } from '@/shared/types/result';
import { dateToKoreaDateString } from '@/shared/utils/format-date';
import { Transaction } from '../database/drizzle/drizzle';
import { pageViewQuery } from '../queries/page-views.query';
import { siteMetricsQuery } from './../queries/site-metrics.query';

const createSiteMetricRepositoryAdapter = (): SiteMetricsRepositoryPort => {
  return {
    updateSiteMetric: async (
      todayKST: string,
      tx: Transaction
    ): Promise<Result<SiteMetric, Error>> => {
      try {
        // 1. 오늘 날짜 데이터 조회
        const todayMetrics = await siteMetricsQuery.getSiteMetricsByDate(todayKST, tx);

        if (!todayMetrics) {
          // 2. 오늘 날짜 데이터가 없으면 어제 날짜 데이터 조회
          const yesterday = dateToKoreaDateString(
            new Date(new Date(todayKST).setDate(new Date(todayKST).getDate() - 1))
          );

          const yesterdayMetrics = await siteMetricsQuery.getSiteMetricsByDate(yesterday, tx);

          // 3. 어제 날짜 데이터가 없으면 페이지 전체 조회후 SiteMetric 생성
          if (!yesterdayMetrics) {
            const pageViews = await pageViewQuery.getAllPageViews(tx);
            const hasPageViews = pageViews.length > 0;

            const totalVisits = hasPageViews
              ? pageViews.reduce((acc, curr) => acc + curr.viewCount, 0)
              : 0;

            const newSiteMetrics = await siteMetricsQuery.createSiteMetrics(
              todayKST,
              tx,
              totalVisits
            );

            if (!newSiteMetrics)
              return { success: false, error: new Error('Failed to create site metrics') };

            return { success: true, data: newSiteMetrics };
          }

          const newFromYesterday = await siteMetricsQuery.createWithYesterdayMetrics(
            yesterdayMetrics,
            todayKST,
            tx
          );

          if (!newFromYesterday)
            return { success: false, error: new Error('Failed to update site metrics') };

          return { success: true, data: newFromYesterday };
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
