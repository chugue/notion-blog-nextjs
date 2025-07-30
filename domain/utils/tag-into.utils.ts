import { TagInfoInsert, TagInfoSelect } from '@/infrastructure/database/supabase/schema/tag-info';
import { PostMetadata, TagFilterItem } from '../entities/blog.entity';
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
  const sortedTags = restTags.sort((a, b) => a.name.localeCompare(b.name));

  return [allTag, ...sortedTags];
};

export const tagInfoToDomain = (record: TagInfoSelect): TagInfo => ({
  id: record.id,
  name: record.name,
  count: record.count ?? 0,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

export const tagInfoToRecord = (tagInfo: TagInfo): Omit<TagInfoInsert, 'id'> => ({
  name: tagInfo.name,
  count: tagInfo.count,
});
