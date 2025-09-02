import { GetPublishedPostParams } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { unstable_cache } from 'next/cache';
import * as notionType from 'notion-types';
import { notion, notionAPI } from '../database/external-api/notion-client';

export const postQuery = {
  getPublishedPosts: async ({
    tag = '전체',
    sort = 'latest',
    pageSize = 10,
    startCursor = undefined,
  }: GetPublishedPostParams): Promise<QueryDatabaseResponse> => {
    return await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          {
            property: 'isPublic',
            select: {
              equals: 'Public',
            },
          },
          ...(tag && tag !== '전체'
            ? [
                {
                  property: 'tag',
                  multi_select: {
                    contains: tag,
                  },
                },
              ]
            : []),
        ],
      },
      sorts: [
        {
          property: 'createdAt',
          direction: sort === 'latest' ? 'descending' : 'ascending',
        },
      ],
      page_size: pageSize,
      start_cursor: startCursor,
    });
  },

  getPostByIdQuery: async (id: string): Promise<Result<notionType.ExtendedRecordMap>> => {
    try {
      const cachedFn = unstable_cache(
        async () => {
          return await notionAPI.getPage(id);
        },
        [`post-${id}`],
        {
          tags: [`post-${id}`, `all-posts`],
        }
      );

      const result = await cachedFn();

      if (!result) {
        return {
          success: false,
          error: new Error('Post not found'),
        };
      }

      return {
        success: true,
        data: result as unknown as notionType.ExtendedRecordMap,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: error as Error,
      };
    }
  },

  getAllPostMetadataCache: async (): Promise<QueryDatabaseResponse> => {
    const cachedFn = unstable_cache(
      async () => {
        // 최초 요청
        let allResults: QueryDatabaseResponse['results'] = [];
        let startCursor: string | undefined = undefined;
        let hasMore = true;

        while (hasMore) {
          const res = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID!,
            filter: {
              and: [{ property: 'isPublic', select: { equals: 'Public' } }],
            },
            start_cursor: startCursor,
          });

          allResults = [...allResults, ...(res.results || [])];
          hasMore = !!res.has_more;
          startCursor = res.next_cursor || undefined;
        }

        return { results: allResults } as QueryDatabaseResponse;
      },
      ['allPostMetadatas'],
      { tags: ['allPostMetadatas'] }
    );

    return await cachedFn();
  },
};
