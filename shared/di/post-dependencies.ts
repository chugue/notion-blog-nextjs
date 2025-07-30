import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { createPostUseCaseAdapter } from '@/application/use-cases/post-usecase.adapter';
import { createPostRepositoryAdapter } from '@/infrastructure/repositories/post.repository.adapter';
import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';

export interface PostDependencies {
  postRepository: PostRepositoryPort;
  postUseCase: PostUseCasePort;
}

export const createPostDependencies = (): PostDependencies => {
  const postRepository = createPostRepositoryAdapter();
  const postUseCase = createPostUseCaseAdapter(postRepository);

  return {
    postRepository,
    postUseCase,
  };
};
