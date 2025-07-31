import { Result } from '@/shared/types/result';
import { TagInfoSelect, tagInfo } from '../database/supabase/schema/tag-info';
import { db } from '../database/drizzle/drizzle';
import { desc } from 'drizzle-orm';
import { TagFilterItem } from '@/domain/entities/post.entity';

export const tagInfoQuery = {
  resetTagInfoList: async (tagInfos: TagFilterItem[]): Promise<Result<TagInfoSelect[]>> => {
    try {
      const result = await db.transaction(async (tx) => {
        // 1. tagInfo db 초기화
        await tx.delete(tagInfo);

        if (tagInfos.length > 0) {
          const tagInfoRecords = tagInfos.map((tagInfo) => ({
            name: tagInfo.name,
            count: tagInfo.count,
          }));

          // 2. tagInfo db 초기화 후 새로운 데이터 삽입
          await tx.insert(tagInfo).values(tagInfoRecords);
        }

        // 3. 최신 데이터 조회
        const updatedTags = await tx.select().from(tagInfo).orderBy(desc(tagInfo.count));

        return updatedTags;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.log('Failed to update tags:', error);

      return {
        success: false,
        error: new Error('Failed to update tags'),
      };
    }
  },
  // getAllTags: async (): Promise<Result<TagInfoSelect[]>> => {
  //   const result = await db.select().from(tagInfo).orderBy(desc(tagInfo.count));

  //   if (result.length === 0) {
  //     return {
  //       success: false,
  //       error: new Error('Failed to get tags'),
  //     };
  //   }

  //   return {
  //     success: true,
  //     data: result,
  //   };
  // },
};
