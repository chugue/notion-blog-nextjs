import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { createTagInfoUseCaseAdapter } from '@/application/use-cases/tag-usecase.adapter';
import { createTagInfoRepositoryAdapter } from '@/infrastructure/repositories/tag-info-repository.adapter';
import { TagInfoUsecasePort } from '@/presentation/ports/tag-usecase.port';

export interface TagInfoDependencies {
  tagInfoRepository: TagInfoRepositoryPort;
  tagInfoUseCase: TagInfoUsecasePort;
}

export const createTagInfoDependencies = (
  postRepository: PostRepositoryPort
): TagInfoDependencies => {
  const tagInfoRepository = createTagInfoRepositoryAdapter(postRepository);
  const tagInfoUseCase = createTagInfoUseCaseAdapter(tagInfoRepository);

  return {
    tagInfoRepository,
    tagInfoUseCase,
  };
};
