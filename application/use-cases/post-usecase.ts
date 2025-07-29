import { Post } from '@/domain/entities/blog.entity';
import { PostRepository } from '@/infrastructure/repositories/post.repository';
import { GetPublishedPostParams, PostMetadataResp } from '@/shared/types/notion';

export interface PostUseCase {
  readonly getPublishedPosts: (params: GetPublishedPostParams) => Promise<PostMetadataResp>;
  readonly getPostById: (id: string) => Promise<Post>;
}

export const createPostUseCaseImpl = (postRepository: PostRepository): PostUseCase => {
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
