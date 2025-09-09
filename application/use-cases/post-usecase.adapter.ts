import {
  AboutPost,
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
    getAboutPage: async (id: string): Promise<AboutPost | null> => {
      const result = await postRepositoryPort.getAboutPage(id);

      if (!result.success) return null;

      return result.data;
    },
    getPostPropertiesById: async (id: string): Promise<PostMetadata | null> => {
      const result = await postRepositoryPort.getPostPropertiesById(id);

      if (!result.success) return null;

      return result.data;
    },
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
      const result = await postRepositoryPort.getPostById(id);

      if (!result.success) return null;

      return result.data;
    },
  };
};
