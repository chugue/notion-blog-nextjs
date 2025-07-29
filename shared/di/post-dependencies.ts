import { PostUseCase, createPostUseCaseImpl } from '@/application/use-cases/post-usecase';
import { PostRepository, postRepositoryImpl } from '@/infrastructure/repositories/post.repository';

export interface PostDependencies {
  postRepository: PostRepository;
  postUseCase: PostUseCase;
}

export const createPostDependencies = (): PostDependencies => {
  const postRepository = postRepositoryImpl();
  const postUseCase = createPostUseCaseImpl(postRepository);

  return {
    postRepository,
    postUseCase,
  };
};
