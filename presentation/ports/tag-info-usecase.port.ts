import { TagFilterItem } from '@/domain/entities/post.entity';

export interface TagInfoUsecasePort {
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
