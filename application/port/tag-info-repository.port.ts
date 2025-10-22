import { TagFilterItem } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';

export interface TagInfoRepositoryPort {
  readonly replaceAllTagFilterItems: (
    tagFilterItems: TagFilterItem[]
  ) => Promise<Result<void, Error>>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
