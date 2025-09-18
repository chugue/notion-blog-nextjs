import { PostMetadata, TagFilterItem } from '../entities/post.entity';
import { TagInfo } from '../entities/tag-info.entity';

export const toTagFilterItem = (posts: PostMetadata[]): TagFilterItem[] => {
  if (posts.length === 0) {
    return [
      {
        id: 'all',
        name: '전체',
        count: 0,
      },
    ];
  }

  const tagCount = posts.reduce(
    (acc, post) => {
      post.tag.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const tags: TagFilterItem[] = Object.entries(tagCount).map(([name, count]) => ({
    id: name,
    name,
    count,
  }));

  tags.unshift({
    id: 'all',
    name: '전체',
    count: posts.length,
  });

  const [allTag, ...restTags] = tags;
  const sortedTags = restTags.sort((a, b) => b.count - a.count);

  return [allTag, ...sortedTags];
};

export const tagInfoToDomain = (record: TagInfo): TagInfo => ({
  id: record.id,
  name: record.name,
  count: record.count ?? 0,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const tagInfoToRecord = (tagInfo: TagInfo): Omit<TagInfo, 'id'> => ({
  name: tagInfo.name,
  count: tagInfo.count,
  createdAt: tagInfo.createdAt,
  updatedAt: tagInfo.updatedAt,
});

export const getTagIcon = (tag: string) => {
  tag = tag.toLowerCase();
  switch (tag) {
    case '전체':
      return '/icons/all.svg';
    case 'java':
      return '/icons/java.svg';
    case 'spring':
      return '/icons/spring-boot.svg';
    case 'webapp':
      return '/icons/web-app.svg';
    case 'system':
      return '/icons/system.svg';
    case 'network':
      return '/icons/network.svg';
    case 'docker':
      return '/icons/docker.svg';
    case 'flutter':
      return '/icons/flutter.svg';
    case 'javascript':
      return '/icons/javascript.svg';
    case 'http':
      return '/icons/http.svg';
    case 'jquery':
      return '/icons/j-query.svg';
    case 'algorithm':
      return '/icons/algorithm.svg';
    case 'react':
      return '/icons/react.svg';
    case 'methodology':
      return '/icons/methodology.svg';
    case 'nestjs':
      return '/icons/nestjs.svg';
    case 'git':
      return '/icons/git.svg';
    case 'python':
      return '/icons/python.svg';
    case 'ajax':
      return '/icons/ajax.svg';
    case 'sql':
      return '/icons/sql.svg';
    case 'css':
      return '/icons/css.svg';
    case 'html':
      return '/icons/html.svg';
    case 'linux':
      return '/icons/linux.svg';
    case 'nextjs':
      return '/icons/nextjs.svg';
    case 'portfolio':
      return '/icons/portfolio.svg';
    default:
      return '/icons/default.svg';
  }
};
