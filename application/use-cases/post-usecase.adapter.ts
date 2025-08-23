import {
  GetPublishedPostParams,
  Post,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';
import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { allPostMetadatasDataCache } from '../data-cache/post.data-cache';
import { PostRepositoryPort } from '../port/post-repository.port';

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
      const { tag, sort } = params;

      // if (tag === '전체' && sort === 'latest') {
      //   const cachedFn = unstable_cache(
      //     async () => {
      //       return await postRepositoryPort.getPostsWithParams(params);
      //     },
      //     ['mainPageDefault'],
      //     {
      //       tags: ['mainPageDefault'],
      //     }
      //   );

      //   const result = await cachedFn();

      //   if (!result.success) {
      //     return {
      //       posts: [],
      //       hasMore: false,
      //       nextCursor: '',
      //     };
      //   }

      //   return result.data;
      // }

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
      const result = await postRepositoryPort.getPostById(id);

      if (!result.success) return null;

      return result.data;
    },
  };
};
