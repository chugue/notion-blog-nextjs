import { TagInfo } from '@/domain/entities/tag';

export interface TagInfoUseCase {
  getAllTags: () => Promise<TagInfo[]>;
}
