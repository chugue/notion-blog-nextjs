import { PostRepository } from './post.repository';
import { toTagFilterItem } from '../queries/tag.query';
import { TagFilterItem } from '@/domain/entities/blog.entity';

export interface TagInfoRepository {
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}

export const createTagInfoRepositoryImpl = (postRepository: PostRepository): TagInfoRepository => {
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
