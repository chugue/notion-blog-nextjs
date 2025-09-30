import { BatchRepositoryPort } from '@/application/port/batch-repository.port';
import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { Result } from '@/shared/types/result';
import { Transaction } from '../database/drizzle/drizzle';
import { siteMetricsQuery } from '../queries/site-metrics.query';

export const createBatchRepositoryAdapter = (): BatchRepositoryPort => {
  return {
    getSiteMetricsByDate: async (
      date: Date,
      tx: Transaction
    ): Promise<Result<SiteMetric, Error>> => {
      const result = await siteMetricsQuery.getSiteMetricsByDate(date, tx);
      if (!result) {
        return { success: false, error: new Error('Failed to get site metrics') };
      }
      return { success: true, data: result };
    },
    createTodayMetrics: async (
      yesterdayMetrics: SiteMetric,
      todayKST: Date,
      tx: Transaction
    ): Promise<Result<SiteMetric, Error>> => {
      const result = await siteMetricsQuery.createTodayMetrics(yesterdayMetrics, todayKST, tx);
      if (!result) {
        return { success: false, error: new Error('Failed to create today metrics') };
      }
      return { success: true, data: result };
    },
  };
};
