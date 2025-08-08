import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { PostRepositoryPort } from '../port/post-repository.port';
import {
  GetPublishedPostParams,
  Post,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';
import { revalidateTag, unstable_cache } from 'next/cache';
import { allPostMetadatasDataCache, getCachedPostById } from '../data-cache/post.data-cache';
import { Result } from '@/shared/types/result';

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

    getPostById: async (id: string): Promise<Post | null> => {
      const result = await getCachedPostById(postRepositoryPort, id)();

      if (!result.success) {
        revalidateTag(`post-${id}`);
        return null;
      }

      return result.data;
    },
  };
};
