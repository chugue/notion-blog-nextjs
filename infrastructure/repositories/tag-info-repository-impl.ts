import { TagInfoRepository } from '@/application/repositories/tag-repository';
import { TagInfo } from '@/domain/entities/tag';
import { getPublishedPosts } from '@/shared/queries/notion';

export const createTagInfoRepositoryImpl = (): TagInfoRepository => ({
  getAllTags: async (): Promise<TagInfo[]> => {
    const result = await getPublishedPosts({});

    if (!result.success) return [];

    const { posts } = result.data;

    // 태그 개수 계산
    const tagCount = posts.reduce(
      (acc, post) => {
        post.language?.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    // TagInfo 엔티티로 변환 👈
    const tags: TagInfo[] = Object.entries(tagCount).map(([name, count]) => ({
      id: name,
      name,
      count,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // "전체" 태그 추가
    const allTag: TagInfo = {
      id: 'all',
      name: '전체',
      count: posts.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return [allTag, ...tags.sort((a, b) => a.name.localeCompare(b.name))];
  },
  getTagByName: async (name: string) => [],
  updateTag: async (tag: TagInfo) => {},
  updateSelectedTag: async (tag: TagInfo) => {},
  deleteTag: async (name: string) => {},
});
