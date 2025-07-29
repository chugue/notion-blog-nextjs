import { TagInfoUseCase, createTagInfoUseCaseImpl } from '@/application/use-cases/tag-usecase';
import { PostRepository } from '@/infrastructure/repositories/post.repository';
import {
  TagInfoRepository,
  createTagInfoRepositoryImpl,
} from '@/infrastructure/repositories/tag-info.repository';

export interface TagInfoDependencies {
  tagInfoRepository: TagInfoRepository;
  tagInfoUseCase: TagInfoUseCase;
}

export const createTagInfoDependencies = (postRepository: PostRepository): TagInfoDependencies => {
  const tagInfoRepository = createTagInfoRepositoryImpl(postRepository);
  const tagInfoUseCase = createTagInfoUseCaseImpl(tagInfoRepository);

  return {
    tagInfoRepository,
    tagInfoUseCase,
  };
};
