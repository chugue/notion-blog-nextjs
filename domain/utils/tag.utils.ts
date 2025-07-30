import { PostMetadata, TagFilterItem } from '../entities/blog.entity';

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
  const sortedTags = restTags.sort((a, b) => a.name.localeCompare(b.name));

  return [allTag, ...sortedTags];
};
