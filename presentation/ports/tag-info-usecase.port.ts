import { TagFilterItem } from '@/domain/entities/blog.entity';

export interface TagInfoUsecasePort {
  readonly resetTagInfoList: (tagFilterItems: TagFilterItem[]) => Promise<TagFilterItem[]>;
  readonly getAllTags: () => Promise<TagFilterItem[]>;
}
