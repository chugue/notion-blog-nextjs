import { TagFilterItem } from '@/domain/entities/blog.entity';

export interface TagInfoUsecasePort {
  readonly resetTagInfo: () => Promise<TagFilterItem[]>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
