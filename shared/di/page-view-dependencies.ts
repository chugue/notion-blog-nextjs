import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { createPageViewUseCaseAdapter } from '@/application/use-cases/page-view-usecase.adapter';
import { createPageViewRepositoryAdapter } from '@/infrastructure/repositories/page-view-repository.adapter';
import createVisitorInfoRepositoryAdapter from '@/infrastructure/repositories/visitor-info-repository.adapter';
import { PageViewUseCasePort } from '@/presentation/ports/page-view-usecase.port';

export interface PageViewDependencies {
  pageViewRepository: PageViewRepositoryPort;
  pageViewUseCase: PageViewUseCasePort;
}

export const createPageViewDependencies = (): PageViewDependencies => {
  const pageViewRepository = createPageViewRepositoryAdapter();
  const visitorInfoRepository = createVisitorInfoRepositoryAdapter();
  const pageViewUseCase = createPageViewUseCaseAdapter(pageViewRepository, visitorInfoRepository);

  return {
    pageViewRepository,
    pageViewUseCase,
  };
};
