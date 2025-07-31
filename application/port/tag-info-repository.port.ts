import { TagFilterItem } from '@/domain/entities/post.entity';

export interface TagInfoRepositoryPort {
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
