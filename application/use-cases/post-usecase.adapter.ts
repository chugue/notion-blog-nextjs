import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { PostRepositoryPort } from '../port/post-repository.port';
import {
  GetPublishedPostParams,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';
import { unstable_cache } from 'next/cache';
import { allPostMetadatasDataCache } from '../data-cache/post.data-cache';

export const createPostUseCaseAdapter = (
  postRepositoryPort: PostRepositoryPort
): PostUseCasePort => {
  return {
    getAllPublishedPostMetadatas: async (): Promise<PostMetadata[]> => {
      const result = await allPostMetadatasDataCache(postRepositoryPort);

      if (!result.success) return [];

      return result.data;
    },

    getPostsWithParams: async (params: GetPublishedPostParams): Promise<PostMetadataResp> => {
      const result = await postRepositoryPort.getPostsWithParams(params);

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
