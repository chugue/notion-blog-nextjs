import { TagFilterItem } from '@/domain/entities/post.entity';

export interface TagInfoUsecasePort {
  readonly updateAllTagCount: () => Promise<void>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
