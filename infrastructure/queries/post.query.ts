import { n2m, notion } from '../database/external-api/notion-client';
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { GetPublishedPostParams, Post } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';
import { getPostMetadata } from '@/domain/utils/post.utils';

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
};

export const getPublishedPostsQuery = async ({
  tag = '전체',
  sort = 'latest',
  pageSize = 12,
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
};

export const getPostByIdQuery = async (id: string): Promise<Result<Post>> => {
  try {
    const response = await notion.pages.retrieve({
      page_id: id,
    });

    if (!response) {
      return {
        success: false,
        error: new Error('Post not found'),
      };
    }

    const mdBlocks = await n2m.pageToMarkdown(response.id);
    const { parent } = n2m.toMarkdownString(mdBlocks);

    const postMetadata = getPostMetadata(response as PageObjectResponse);

    return {
      success: true,
      data: {
        mdBlocks,
        markdown: parent,
        post: postMetadata,
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
