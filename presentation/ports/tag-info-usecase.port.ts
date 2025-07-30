import { TagFilterItem } from '@/domain/entities/post.entity';

export interface TagInfoUsecasePort {
  readonly resetTagInfoList: (tagFilterItems: TagFilterItem[]) => Promise<TagFilterItem[]>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
