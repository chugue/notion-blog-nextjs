import { PostRepositoryPort } from '@/application/port/post-repository.port';
import {
  GetPublishedPostParams,
  Post,
  PostMetadata,
  PostMetadataResp,
} from '@/domain/entities/post.entity';
import { getPostMetadata } from '@/domain/utils/post.utils';
import { Result } from '@/shared/types/result';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import * as notionType from 'notion-types';
import { postQuery } from '../queries/post.query';

export const createPostRepositoryAdapter = (): PostRepositoryPort => {
  return {
    getAllPublishedPosts: async (): Promise<Result<PostMetadata[]>> => {
      try {
        let postMetadata: PostMetadata[] = [];

        // 한 번 요청당 최대 갯수가 100개
        const initialResponse = await postQuery.getPublishedPosts({
          pageSize: 100,
        });

        postMetadata = initialResponse.results
          .filter((page): page is PageObjectResponse => 'properties' in page)
          .map(getPostMetadata) as PostMetadata[];

        let hasMore = initialResponse.has_more;
        let nextCursor = initialResponse.next_cursor || '';

        while (hasMore) {
          const nextResponse = await postQuery.getPublishedPosts({
            pageSize: 100,
            startCursor: nextCursor,
          });

          const additionalPosts = nextResponse.results
            .filter((page): page is PageObjectResponse => 'properties' in page)
            .map(getPostMetadata) as PostMetadata[];

          postMetadata = [...postMetadata, ...additionalPosts];

          hasMore = nextResponse.has_more;
          nextCursor = nextResponse.next_cursor || '';
        }

        return {
          success: true,
          data: postMetadata,
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          error: error as Error,
        };
      }
    },

    getPostsWithParams: async ({
      tag = '전체',
      sort = 'latest',
      pageSize,
      startCursor = undefined,
    }: GetPublishedPostParams): Promise<Result<PostMetadataResp>> => {
      try {
        const response = await postQuery.getPublishedPosts({
          tag,
          sort,
          pageSize,
          startCursor,
        });

        const posts = response.results
          .filter((page): page is PageObjectResponse => 'properties' in page)
          .map(getPostMetadata);

        return {
          success: true,
          data: {
            posts,
            hasMore: response.has_more,
            nextCursor: response.next_cursor || '',
          },
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          error: error as Error,
        };
      }
    },

    getPostById: async (id: string): Promise<Result<Post>> => {
      const result = await postQuery.getPostByIdQuery(id);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      const allPostMetadatas = await postQuery.getAllPostMetadataCache();
      const property = allPostMetadatas.results.find((page) => {
        return page.id === id;
      });

      if (!property) {
        return {
          success: false,
          error: new Error('Post not found'),
        };
      }

      return {
        success: true,
        data: {
          recordMap: result.data as unknown as notionType.ExtendedRecordMap,
          properties: getPostMetadata(property as PageObjectResponse),
        },
      };
    },
  };
};
