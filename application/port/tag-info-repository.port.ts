import { TagFilterItem } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';

export interface TagInfoRepositoryPort {
  readonly getAllTagInfosViaSupabase: () => Promise<Result<TagFilterItem[], Error>>;
  readonly replaceAllTagFilterItems: (
    tagFilterItems: TagFilterItem[]
  ) => Promise<Result<void, Error>>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
