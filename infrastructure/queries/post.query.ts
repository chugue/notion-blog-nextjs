import { MdBlock } from 'notion-to-md/build/types';
import { n2m, notion, notionAPI } from '../database/external-api/notion-client';
import * as notionType from 'notion-types';
import {
  BlockObjectResponse,
  ListBlockChildrenResponse,
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

// export const getPostByIdQuery = async (id: string): Promise<Result<Post>> => {
//   try {
//     const [properties, allBlocks] = await Promise.all([
//       notion.pages.retrieve({
//         page_id: id,
//       }),
//       getAllBlocks(id),
//     ]);

//     if (!properties || !allBlocks) {
//       return {
//         success: false,
//         error: new Error('Post not found'),
//       };
//     }

//     console.log('👉👉👉👉👉allBlocks', allBlocks);
//     console.log('👉👉👉👉👉properties', properties);

//     const postMetadata = getPostMetadata(properties as PageObjectResponse);

//     return {
//       success: true,
//       data: {
//         allBlocks,
//         properties: postMetadata,
//       },
//     };
//   } catch (error) {
//     console.log(error);
//     return {
//       success: false,
//       error: error as Error,
//     };
//   }
// };

export const getPostByIdQuery = async (id: string): Promise<Result<Post>> => {
  try {
    // const [properties, recordMap] = await Promise.all([
    //   notion.pages.retrieve({
    //     page_id: id,
    //   }),
    //   notionAPI.getPage(id),
    // ]);

    const recordMap = await notionAPI.getPage(id);
    const properties = await notion.pages.retrieve({
      page_id: id,
    });

    if (!properties || !recordMap) {
      return {
        success: false,
        error: new Error('Post not found'),
      };
    }

    // console.log('👉👉👉👉👉recordMap.signed_urls', recordMap.signed_urls);
    // console.log('👉👉👉👉👉properties', properties);

    const postMetadata = getPostMetadata(properties as PageObjectResponse);

    return {
      success: true,
      data: {
        recordMap: recordMap as notionType.ExtendedRecordMap,
        properties: postMetadata,
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

const getAllBlocks = async (blockId: string): Promise<BlockObjectResponse[]> => {
  const allBlocks: BlockObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const block of response.results) {
      if ('type' in block) {
        allBlocks.push(block as BlockObjectResponse);

        // 하위 블록이 있으면 재귀적으로 가져오기
        if (block.has_children) {
          const childBlocks = await getAllBlocks(block.id);
          allBlocks.push(...childBlocks);
        }
      }
    }

    cursor = response.next_cursor || undefined;
  } while (cursor);

  return allBlocks;
};

// export const getPostByIdQuery = async (id: string): Promise<Result<Post>> => {
//   try {
//     const response = await notion.pages.retrieve({
//       page_id: id,
//     });

//     if (!response) {
//       return {
//         success: false,
//         error: new Error('Post not found'),
//       };
//     }

//     const mdBlocks = await n2m.pageToMarkdown(response.id);
//     const { parent } = n2m.toMarkdownString(mdBlocks);

//     const postMetadata = getPostMetadata(response as PageObjectResponse);

//     return {
//       success: true,
//       data: {
//         mdBlocks,
//         markdown: parent,
//         post: postMetadata,
//       },
//     };
//   } catch (error) {
//     console.log(error);
//     return {
//       success: false,
//       error: error as Error,
//     };
//   }
// };
