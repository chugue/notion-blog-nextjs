import { TagInfo } from '@/domain/entities/tag';

export interface TagInfoRepository {
  readonly getAllTags: () => Promise<TagInfo[]>;
  readonly getTagByName: (name: string) => Promise<TagInfo[]>;
  readonly updateTag: (tag: TagInfo) => Promise<void>;
  readonly updateSelectedTag: (tag: TagInfo) => Promise<void>;
  readonly deleteTag: (name: string) => Promise<void>;
}
