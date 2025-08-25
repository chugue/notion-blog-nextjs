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
      const result = await notionAPI.getPage(id);

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
            ],
          },
        });
      },
      ['allPostMetadatas'],
      {
        tags: ['allPostMetadatas'],
      }
    );

    const result = await cachedFn();

    return result;
  },
};
