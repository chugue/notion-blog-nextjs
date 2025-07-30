import { TagFilterItem } from '@/domain/entities/blog.entity';

export interface TagInfoRepositoryPort {
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
