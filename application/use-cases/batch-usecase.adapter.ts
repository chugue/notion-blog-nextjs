import { db } from '@/infrastructure/database/drizzle/drizzle';
import { BatchUsecasePort } from '@/presentation/ports/batch-usecase-port';
import { Result } from '@/shared/types/result';
import { getKstDate, getYesterday } from '@/shared/utils/format-date';
import { BatchRepositoryPort } from '../port/batch-repository.port';

export const createBatchUsecaseAdapter = (
  batchRepository: BatchRepositoryPort
): BatchUsecasePort => {
  return {
    createTodayMetrics: async (): Promise<Result<void, Error>> => {
      const todayKST = getKstDate();

      try {
        const result = await db.transaction(async (tx) => {
          const todayMetrics = await batchRepository.getSiteMetricsByDate(todayKST, tx);

          if (todayMetrics.success) {
            return { success: true, data: undefined };
          }

          const yesterday = getYesterday(todayKST);
          const yesterdayMetrics = await batchRepository.getSiteMetricsByDate(yesterday, tx);

          if (!yesterdayMetrics.success) {
            return { success: false, error: new Error('Yesterday metrics not found') };
          }

          const newTodayMetrics = await batchRepository.createTodayMetrics(
            yesterdayMetrics.data,
            todayKST,
            tx
          );

          if (!newTodayMetrics) {
            return { success: false, error: new Error('Failed to create today metrics') };
          }

          return { success: true, data: undefined };
        });

        return result as Result<void>;
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
  };
};
