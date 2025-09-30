import { Result } from '@/shared/types/result';

export interface BatchUsecasePort {
  readonly createTodayMetrics: () => Promise<Result<void, Error>>;
}
