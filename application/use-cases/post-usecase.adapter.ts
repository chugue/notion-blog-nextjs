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

      if (!result.success) {
        // 글이 진짜 없으면 null → notFound(). 일시적 fetch 실패(레이트리밋 등)는
        // throw 해서 ISR이 다음 요청에 재시도하게 한다 — 영구 404로 굽지 않는다.
        if (result.error?.message === 'Post not found') return null;

        throw result.error;
      }

      return result.data;
    },
  };
};
