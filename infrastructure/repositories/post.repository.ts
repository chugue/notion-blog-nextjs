import { Result } from '@/shared/types/result';
import { GetPublishedPostParams, PostMetadataResp } from '@/shared/types/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { getPostByIdQuery, getPostMetadata, getPublishedPostsQuery } from '../queries/post.query';
import { Post } from '@/domain/entities/blog.entity';

export interface PostRepository {
  readonly getPublishedPosts: (params: GetPublishedPostParams) => Promise<Result<PostMetadataResp>>;
  readonly getPostById: (id: string) => Promise<Result<Post>>;
}

export const postRepositoryImpl = (): PostRepository => {
  return {
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
