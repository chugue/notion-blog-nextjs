import { GetPublishedPostParams, GetPublishedPostResponse, NotionUser } from '@/lib/types/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Post, TagFilterItem } from '@/lib/types/blog';
import { n2m, notion } from '../notion-client';

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

const getPostMetadata = (page: PageObjectResponse): Post => {
  const { properties } = page;

  return {
    id: page.id,
    title: properties.title.type === 'title' ? (properties.title.title[0]?.plain_text ?? '') : '',
    coverImage: getCoverImage(page.cover),
    language:
      properties.language.type === 'multi_select'
        ? properties.language.multi_select.map((tag) => tag.name)
        : [],
    tool:
      properties.tool.type === 'multi_select'
        ? properties.tool.multi_select.map((tag) => tag.name)
        : [],
    author:
      properties.author.type === 'people'
        ? ((properties.author.people[0] as NotionUser)?.name ?? '')
        : '',
    date:
      properties.createdAt.type === 'created_time' ? (properties.createdAt.created_time ?? '') : '',
  };
};

export const getPublishedPosts = async ({
  tag = '전체',
  sort = 'latest',
  pageSize = 10,
  startCursor = undefined,
}: GetPublishedPostParams): Promise<GetPublishedPostResponse> => {
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
      posts,
      hasMore: response.has_more,
      nextCursor: response.next_cursor || '',
    };
  } catch (error) {
    console.log(error);
    throw new Error('Notion database not found');
  }
};

export const getTags = async (): Promise<TagFilterItem[]> => {
  const { posts } = await getPublishedPosts({});

  // 모든 태그를 추출하고 각 태그의 출현 횟수를 계산
  const tagCount = posts.reduce(
    (acc, post) => {
      post.language?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // TagFilterItem 형식으로 변환
  const tags: TagFilterItem[] = Object.entries(tagCount).map(([name, count]) => ({
    id: name,
    name,
    count,
    icon: tagCount,
  }));

  // "전체" 태그 추가
  tags.unshift({
    id: 'all',
    name: '전체',
    count: posts.length,
  });

  // 태그 이름 기준으로 정렬 ("전체" 태그는 항상 첫 번째에 위치하도록 제외)
  const [allTag, ...restTags] = tags;
  const sortedTags = restTags.sort((a, b) => a.name.localeCompare(b.name));

  return [allTag, ...sortedTags];
};

export const getPostById = async (
  id: string
): Promise<{
  markdown: string;
  post: Post | null;
}> => {
  try {
    const response = await notion.pages.retrieve({
      page_id: id,
    });

    if (!response) {
      return {
        markdown: '',
        post: null,
      };
    }

    const mdBlocks = await n2m.pageToMarkdown(response.id);
    const { parent } = n2m.toMarkdownString(mdBlocks);

    return {
      markdown: parent,
      post: getPostMetadata(response as PageObjectResponse),
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
