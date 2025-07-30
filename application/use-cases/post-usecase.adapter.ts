import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { GetPublishedPostParams, PostMetadataResp } from '@/shared/types/notion';
import { PostRepositoryPort } from '../port/post-repository.port';
import { PostMetadata } from '@/domain/entities/blog.entity';

export const createPostUseCaseAdapter = (
  postRepositoryPort: PostRepositoryPort
): PostUseCasePort => {
  return {
    getAllPublishedPostMetadatas: async (): Promise<PostMetadata[]> => {
      const result = await postRepositoryPort.getAllPublishedPosts();

      if (!result.success) return [];

      return result.data;
    },

    getPublishedPosts: async (params: GetPublishedPostParams): Promise<PostMetadataResp> => {
      const result = await postRepositoryPort.getPublishedPosts(params);

      if (!result.success) {
        return {
          posts: [],
          hasMore: false,
          nextCursor: '',
        };
      }

      return result.data;
    },

    getPostById: async (id: string) => {
      const result = await postRepositoryPort.getPostById(id);

      if (!result.success) {
        return null;
      }

      return result.data;
    },
  };
};
