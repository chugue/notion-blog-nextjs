import { Post, TagFilterItem } from '@/types/blog';
import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  UserObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const getTagList = async (posts: Post[]): Promise<TagFilterItem[]> => {
  const tagCounts = posts
    .flatMap((post) => post.tags || [])
    .reduce((acc, tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1);
      return acc;
    }, new Map<string, number>());

  const totalPosts = posts.length;

  const tagList: TagFilterItem[] = [
    {
      id: 'all',
      name: '전체',
      count: totalPosts,
    },
    ...Array.from(tagCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tagName, count]) => ({
        id: tagName.toLowerCase().replace(/\s+/g, '-'),
        name: tagName,
        count,
      })),
  ];

  return tagList;
};

const getCoverImage = (cover: PageObjectResponse['cover'] | null) => {
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

export const getPublishedPost = async (): Promise<Post[]> => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      select: {
        equals: 'Published',
      },
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  // NotionAPI 응답을 Post 타입으로 변환
  const posts: Post[] = response.results.map((page) => {
    const properties = (page as { properties: Record<string, unknown> }).properties;

    // Title 추출
    const title =
      (properties.Title as { title?: { plain_text: string }[] })?.title?.[0]?.plain_text || '';

    // Description 추출
    const description =
      (properties.Description as { rich_text?: { plain_text: string }[] })?.rich_text?.[0]
        ?.plain_text || '';

    // Tags 추출
    const tags =
      (properties.Tags as { multi_select?: { name: string }[] })?.multi_select?.map(
        (tag) => tag.name
      ) || [];

    // Author 추출 (people 타입이지만 Post 타입에서는 string으로 정의됨)
    const author = (properties.Author as UserObjectResponse)?.name || '';

    // Date 추출
    const date = (properties.Date as { date?: { start: string } })?.date?.start || '';

    // Modified Date 추출
    const modifiedDate =
      (properties['Modified Date'] as { date?: { start: string } })?.date?.start || '';

    // Slug 추출
    const slug =
      (properties.Slug as { rich_text?: { plain_text: string }[] })?.rich_text?.[0]?.plain_text ||
      '';

    // Cover Image 추출
    const coverImage = getCoverImage((page as PageObjectResponse).cover) || '';

    return {
      id: (page as { id: string }).id,
      title,
      description: description || undefined,
      coverImage: coverImage || undefined,
      tags: tags.length > 0 ? tags : undefined,
      author: author || undefined,
      date: date || undefined,
      modifiedDate: modifiedDate || undefined,
      slug,
    };
  });

  return posts;
};
