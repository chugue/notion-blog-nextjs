import { toTagFilterItem } from '../queries/tag.query';
import { TagFilterItem } from '@/domain/entities/blog.entity';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { PostRepositoryPort } from '@/application/port/post-repository.port';

export const createTagInfoRepositoryAdapter = (
  postRepository: PostRepositoryPort
): TagInfoRepositoryPort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await postRepository.getPublishedPosts({});

      if (!result.success) return [];

      const { posts } = result.data;
      const tagFilterItems = toTagFilterItem(posts);

      return tagFilterItems;
    },
  };
};
