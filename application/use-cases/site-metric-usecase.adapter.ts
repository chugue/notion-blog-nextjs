import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { SiteMetricsUsecasePort } from '@/presentation/ports/site-metrics-usecase.port';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { dateToStringYYYYMMDD, getKstDate } from '@/shared/utils/format-date';
import crypto from 'crypto';
import { SiteMetricsRepositoryPort } from '../port/site-metrics-repository.port';

const createSiteMetricUsecaseAdapter = (
  siteMetricRepo: SiteMetricsRepositoryPort
): SiteMetricsUsecasePort => {
  return {
    getThirtyDaysSiteMetrics: async (): Promise<MainPageChartData[]> => {
      const today = getKstDate(); // KST 기준 현재 시각

      // 지난 30일 날짜 목록 생성 (앞에서부터: 29일 전 -> 오늘)
      const dateStrings = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (29 - i));
        return dateToStringYYYYMMDD(date);
      });

      const startDateUTC = dateStrings[0];
      const endDateUTC = dateStrings[dateStrings.length - 1];

      const result = await siteMetricRepo.getSiteMetricsByDateRange(startDateUTC, endDateUTC);

      console.log('result:', result);

      // 조회 실패 시에도 30일 배열 반환 (모두 0)
      if (!result.success) {
        return dateStrings.map((dateString) => ({
          id: crypto.randomUUID(),
          date: dateString,
          daily: 0,
          total: 0,
        }));
      }

      const fetchedMap = new Map<string, SiteMetric>();
      result.data.forEach((metric) => {
        if (metric && metric.date) fetchedMap.set(metric.date, metric);
      });

      // 병합: 존재하면 실제 값, 없으면 기본값(0)
      const merged: MainPageChartData[] = dateStrings.map((date) => {
        const metric = fetchedMap.get(date);
        if (metric) {
          return {
            id: metric.id,
            date: metric.date,
            daily: metric.dailyVisits,
            total: metric.totalVisits,
          };
        }
        return {
          id: crypto.randomUUID(),
          date: date,
          daily: 0,
          total: 0,
        };
      });

      console.log('merged:', merged);
      return merged;
    },
  };
};

export default createSiteMetricUsecaseAdapter;
