import { PostMetadata, TagFilterItem } from '@/domain/entities/blog.entity';
import { Result } from '@/shared/types/result';
import { TagInfoSelect, tagInfo } from '../database/supabase/schema/tag-info';
import { db } from '../database/drizzle/drizzle';
import { TagInfo } from '@/domain/entities/tag.entity';
import { desc } from 'drizzle-orm';

export const updateTagsQuery = async (tagInfos: TagInfo[]): Promise<Result<TagInfoSelect[]>> => {
  try {
    const result = await db.transaction(async (tx) => {
      await tx.delete(tagInfo);

      if (tagInfos.length > 0) {
        const tagInfoRecords = tagInfos.map((tagInfo) => ({
          name: tagInfo.name,
          count: tagInfo.count,
        }));

        await tx.insert(tagInfo).values(tagInfoRecords);
      }

      const updatedTags = await tx.select().from(tagInfo).orderBy(desc(tagInfo.count));

      return updatedTags;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.log('Failed to update tags:', error);

    return {
      success: false,
      error: new Error('Failed to update tags'),
    };
  }
};

export const toTagFilterItem = (posts: PostMetadata[]): TagFilterItem[] => {
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
