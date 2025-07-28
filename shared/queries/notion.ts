import { PageObjectResponse } from '@notionhq/client';
import { GetPublishedPostParams, GetPublishedPostResponse } from '../types/notion';
import { Result } from '../types/result';
import { getPostMetadata } from '../services/notion';
import { notion } from '@/infrastructure/database/external-api/notion-client';

export const getPublishedPosts = async ({
  tag = '전체',
  sort = 'latest',
  pageSize = 10,
  startCursor = undefined,
}: GetPublishedPostParams): Promise<Result<GetPublishedPostResponse>> => {
  try {
    const response = await notion.databases.query({
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
                  property: 'language',
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
};
