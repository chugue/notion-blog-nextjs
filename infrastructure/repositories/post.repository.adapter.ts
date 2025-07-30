import { Result } from '@/shared/types/result';
import { GetPublishedPostParams, PostMetadataResp } from '@/shared/types/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import {
  getPostByIdQuery,
  getPostMetadata,
  getPublishedPostsQuery,
  postQuery,
} from '../queries/post.query';
import { PostRepositoryPort } from '@/application/port/post-repository.port';
import { PostMetadata } from '@/domain/entities/blog.entity';

// UI가 원하는 데이터 형식으로 가공

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
    getPublishedPosts: async ({
      tag = '전체',
      sort = 'latest',
      pageSize = 10,
      startCursor = undefined,
    }: GetPublishedPostParams): Promise<Result<PostMetadataResp>> => {
      try {
        const response = await getPublishedPostsQuery({
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

    getPostById: async (id: string) => {
      const result = await getPostByIdQuery(id);

      return result;
    },
  };
};
