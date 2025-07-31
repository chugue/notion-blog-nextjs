import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { createTagInfoUseCaseAdapter } from '@/application/use-cases/tag-info-usecase.adapter';
import { createTagInfoRepositoryAdapter } from '@/infrastructure/repositories/tag-info-repository.adapter';
import { TagInfoUsecasePort } from '@/presentation/ports/tag-info-usecase.port';

export interface TagInfoDependencies {
  tagInfoRepository: TagInfoRepositoryPort;
  tagInfoUseCase: TagInfoUsecasePort;
}

export const createTagInfoDependencies = (
  postRepositoryPort: PostRepositoryPort
): TagInfoDependencies => {
  const tagInfoRepository = createTagInfoRepositoryAdapter(postRepositoryPort);
  const tagInfoUseCase = createTagInfoUseCaseAdapter(tagInfoRepository, postRepositoryPort);

  return {
    tagInfoRepository,
    tagInfoUseCase,
  };
};
