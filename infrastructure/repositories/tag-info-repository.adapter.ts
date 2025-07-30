import { TagFilterItem } from '@/domain/entities/post.entity';
import { TagInfoRepositoryPort } from '@/application/port/tag-info-repository.port';
import { tagInfoToDomain, toTagFilterItem } from '@/domain/utils/tag-into.utils';
import { tagInfoQuery } from '../queries/tag-info.query';

export const createTagInfoRepositoryAdapter = (): TagInfoRepositoryPort => {
  return {
    getAllTags: async (): Promise<TagFilterItem[]> => {
      const result = await tagInfoQuery.getAllTags();

      if (!result.success) return [];

      return result.data.map((tagInfo) => tagInfoToDomain(tagInfo));
    },

    resetTagInfoList: async (tagFilterItems: TagFilterItem[]): Promise<TagFilterItem[]> => {
      const result = await tagInfoQuery.resetTagInfoList(tagFilterItems);

      if (!result.success) return [];

      return result.data.map((tagInfo) => ({
        id: tagInfo.id,
        name: tagInfo.name,
        count: tagInfo.count ?? 0,
      })) as TagFilterItem[];
    },
  };
};
