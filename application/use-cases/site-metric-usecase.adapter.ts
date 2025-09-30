import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { SiteMetricsUsecasePort } from '@/presentation/ports/site-metrics-usecase.port';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { dateToKoreaDateString } from '@/shared/utils/format-date';
import crypto from 'crypto';
import { SiteMetricsRepositoryPort } from '../port/site-metrics-repository.port';

const createSiteMetricUsecaseAdapter = (
  siteMetricRepo: SiteMetricsRepositoryPort
): SiteMetricsUsecasePort => {
  return {
    getThirtyDaysSiteMetrics: async (): Promise<MainPageChartData[]> => {
      const today = new Date();

      // 지난 30일 날짜 목록 생성 (앞에서부터: 29일 전 -> 오늘)
      const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (29 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const startDate = dates[0]; // 한국시간 날짜
      const endDate = dates[dates.length - 1]; // 한국시간 날짜

      const result = await siteMetricRepo.getSiteMetricsByDateRange(startDate, endDate);

      // 조회 실패 시에도 30일 배열 반환 (모두 0)
      if (!result.success) {
        return dates.map((date) => ({
          id: crypto.randomUUID(),
          date: dateToKoreaDateString(date),
          daily: 0,
          total: 0,
        }));
      }

      const fetchedMap = new Map<string, SiteMetric>();
      result.data.forEach((metric) => {
        if (metric && metric.date) fetchedMap.set(dateToKoreaDateString(metric.date), metric);
      });

      // 병합: 존재하면 실제 값, 없으면 기본값(0)
      const merged: MainPageChartData[] = dates.map((date) => {
        const metric = fetchedMap.get(dateToKoreaDateString(date));
        if (metric) {
          return {
            id: metric.id,
            date: dateToKoreaDateString(metric.date),
            daily: metric.dailyVisits,
            total: metric.totalVisits,
          };
        }
        return {
          id: crypto.randomUUID(),
          date: dateToKoreaDateString(date),
          daily: 0,
          total: 0,
        };
      });

      console.log(
        'dates:',
        dates.map((d) => ({ iso: d.toISOString(), kst: dateToKoreaDateString(d) }))
      );
      console.log(
        'fetched:',
        result.data.map((m) => ({
          iso: m.date?.toISOString(),
          kst: dateToKoreaDateString(new Date(m.date)),
          id: m.id,
        }))
      );

      return merged;
    },
  };
};

export default createSiteMetricUsecaseAdapter;
