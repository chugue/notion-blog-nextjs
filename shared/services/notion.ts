import { NotionUser } from '@/shared/types/notion';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { GetPostByIdResp, PostMetadata, TagFilterItem } from '@/shared/types/blog';
import { Result } from '../types/result';
import { getPublishedPosts } from '../queries/notion';
import { n2m, notion } from '@/infrastructure/database/external-api/notion-client';

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

export const getPostMetadata = (page: PageObjectResponse): PostMetadata => {
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

export const getTags = async (): Promise<TagFilterItem[]> => {
  const result = await getPublishedPosts({});

  if (!result.success) {
    return [];
  }
  const { posts } = result.data;

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

export const getPostById = async (id: string): Promise<Result<GetPostByIdResp>> => {
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
