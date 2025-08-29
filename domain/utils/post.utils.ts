import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionUser } from '../entities/notion.entity';
import { PostMetadata } from '../entities/post.entity';

export const convertS3UrlToNotionUrl = (s3Url: string, pageId: string): string | null => {
  try {
    // 1. S3 URL 파싱하여 경로 정보 추출
    const url = new URL(s3Url);
    const pathParts = url.pathname.split('/').filter((part) => part);

    const [spaceId, fileId, ...fileNameParts] = pathParts;
    const filename = fileNameParts.join('/');

    // 2. 영구 URL의 인코딩된 경로 생성
    const rawPath = `attachment:${fileId}:${filename}`;
    const encodedPath = encodeURIComponent(rawPath);

    // 3. 쿼리 파라미터 생성
    const params = new URLSearchParams({
      table: 'block',
      id: pageId,
      spaceId,
    });

    // 4. 모든 요소를 조합하여 최종 URL 반환
    return `https://www.notion.so/image/${encodedPath}?${params.toString()}`;
  } catch (error) {
    console.error('Error parsing the S3 URL:', error);
    return null;
  }
};

const getCoverImage = (cover: PageObjectResponse['cover'], pageId: string) => {
  if (!cover) return '';

  switch (cover.type) {
    case 'external': {
      return convertS3UrlToNotionUrl(cover.external.url, pageId);
    }
    case 'file': {
      return convertS3UrlToNotionUrl(cover.file.url, pageId);
    }
    default:
      return '';
  }
};

export const getPostMetadata = (page: PageObjectResponse): PostMetadata => {
  const { properties } = page;

  return {
    id: page.id,
    title: properties.title.type === 'title' ? (properties.title.title[0]?.plain_text ?? '') : '',
    coverImage: getCoverImage(page.cover, page.id) ?? undefined,
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

export const sortByDate = (posts: PostMetadata[]): PostMetadata[] => {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const filterByTag = (posts: PostMetadata[], tag: string): PostMetadata[] => {
  if (tag === 'all') return posts;
  return posts.filter((post) => post.tag.includes(tag));
};

export const filterBySearch = (posts: PostMetadata[], query: string): PostMetadata[] => {
  if (!query.trim()) return posts;
  const lowerQuery = query.toLowerCase();
  return posts.filter((post) => post.title.toLowerCase().includes(lowerQuery));
};
