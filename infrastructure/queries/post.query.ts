import { GetPublishedPostParams } from '@/shared/types/notion';
import { n2m, notion } from '../database/external-api/notion-client';
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { Post, PostMetadata } from '@/domain/entities/blog.entity';
import { NotionUser } from '@/domain/entities/notion.entity';
import { Result } from '@/shared/types/result';

export const getPublishedPostsQuery = async ({
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
};

export const getPostMetadata = (page: PageObjectResponse): PostMetadata => {
  const { properties } = page;

  return {
    id: page.id,
    title: properties.title.type === 'title' ? (properties.title.title[0]?.plain_text ?? '') : '',
    coverImage: getCoverImage(page.cover),
    tag:
      properties.tag.type === 'multi_select'
        ? properties.tag.multi_select.map((tag) => tag.name)
        : [],
    author:
      properties.author.type === 'people'
        ? ((properties.author.people[0] as NotionUser)?.name ?? '')
        : '',
    date:
      properties.createdAt.type === 'created_time' ? (properties.createdAt.created_time ?? '') : '',
  };
};

const getCoverImage = (cover: PageObjectResponse['cover']) => {
  if (!cover) return '';

  switch (cover.type) {
    case 'external':
      return cover.external.url;
    case 'file':
      return cover.file.url;
    default:
      return '';
  }
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

    return {
      success: true,
      data: {
        markdown: parent,
        post: getPostMetadata(response as PageObjectResponse),
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
