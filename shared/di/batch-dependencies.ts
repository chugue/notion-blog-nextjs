import { BatchRepositoryPort } from '@/application/port/batch-repository.port';
import { createBatchUsecaseAdapter } from '@/application/use-cases/batch-usecase.adapter';
import { createBatchRepositoryAdapter } from '@/infrastructure/repositories/batch-repository.adapter';
import { BatchUsecasePort } from '@/presentation/ports/batch-usecase-port';

export interface BatchDependencies {
  batchUsecase: BatchUsecasePort;
  batchRepository: BatchRepositoryPort;
}

export const createBatchDependencies = (): BatchDependencies => {
  const batchRepository = createBatchRepositoryAdapter();
  const batchUsecase = createBatchUsecaseAdapter(batchRepository);

  return {
    batchRepository,
    batchUsecase,
  };
};
