import { TagFilterItem } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';

export interface TagInfoUsecasePort {
  readonly updateAllTagCount: () => Promise<Result<void, Error>>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
