import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { PostMetadata } from '../entities/post.entity';
import { NotionUser } from '../entities/notion.entity';

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
