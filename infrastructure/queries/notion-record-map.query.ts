import { notionRecordMaps } from '@/infrastructure/database/supabase/schema';
import { eq } from 'drizzle-orm';
import { ExtendedRecordMap } from 'notion-types';
import { db } from '../database/drizzle/drizzle';

// recordMap 영속 캐시 접근자. 캐시는 보조 레이어이므로 DB 실패는 절대 렌더를 막지 않는다
// (읽기 실패 → 미스로 간주해 Notion에서 페치, 쓰기 실패 → 무시).
const notionRecordMapQuery = {
  get: async (id: string): Promise<ExtendedRecordMap | null> => {
    try {
      const row = await db.query.notionRecordMaps.findFirst({
        where: eq(notionRecordMaps.id, id),
      });

      return row ? (row.recordMap as ExtendedRecordMap) : null;
    } catch (error) {
      console.log('[record-map-cache] read miss (falling back to Notion):', error);
      return null;
    }
  },

  upsert: async (id: string, recordMap: ExtendedRecordMap): Promise<void> => {
    try {
      await db
        .insert(notionRecordMaps)
        .values({ id, recordMap, fetchedAt: new Date() })
        .onConflictDoUpdate({
          target: notionRecordMaps.id,
          set: { recordMap, fetchedAt: new Date() },
        });
    } catch (error) {
      console.log('[record-map-cache] write failed (non-fatal):', error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await db.delete(notionRecordMaps).where(eq(notionRecordMaps.id, id));
    } catch (error) {
      console.log('[record-map-cache] delete failed (non-fatal):', error);
    }
  },
};

export default notionRecordMapQuery;
