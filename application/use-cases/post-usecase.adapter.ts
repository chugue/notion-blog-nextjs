import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { GetPublishedPostParams } from '@/shared/types/notion';
import { PostRepositoryPort } from '../port/post-repository.port';

export const createPostUseCaseAdapter = (postRepository: PostRepositoryPort): PostUseCasePort => {
  return {
    getPublishedPosts: async (params: GetPublishedPostParams) => {
      const result = await postRepository.getPublishedPosts(params);

      if (!result.success) {
        throw new Error(result.error?.message);
      }

      return result.data;
    },
    getPostById: async (id: string) => {
      const result = await postRepository.getPostById(id);

      if (!result.success) {
        throw new Error(result.error?.message);
      }

      return result.data;
    },
  };
};
