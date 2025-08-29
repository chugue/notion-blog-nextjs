import {
  GetVisitorInfoParams,
  VisitorInfoRepositoryPort,
} from '@/application/port/visitor-info-repository.port';
import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { and, eq } from 'drizzle-orm';
import { Transaction } from '../database/drizzle/drizzle';
import { VisitorInfoSelect, visitorInfo, visitorInfoToDomain } from '../database/supabase/schema';

const createVisitorInfoRepositoryAdapter = (): VisitorInfoRepositoryPort => {
  return {
    getVisitorInfoOrCreate: async (
      { ipHash, todayKST, pathName, userAgent }: GetVisitorInfoParams,
      tx: Transaction
    ) => {
      try {
        // 1. 방문자 정보 조회
        const record = await tx
          .select()
          .from(visitorInfo)
          .where(and(eq(visitorInfo.ipHash, ipHash), eq(visitorInfo.date, todayKST)))
          .limit(1);

        // 2. 방문자 정보 없으면 생성
        if (record.length === 0) {
          const newRecord = await tx
            .insert(visitorInfo)
            .values({
              ipHash,
              date: todayKST,
              visitedPathnames: [pathName],
              userAgent: userAgent,
            })
            .returning();

          return { success: true, data: visitorInfoToDomain(newRecord[0] as VisitorInfoSelect) };
        }

        // 3. 방문자 정보 있을 때 중복 방문 체크
        if (record[0].visitedPathnames.includes(pathName)) {
          return {
            success: false,
            error: new Error('Visitor already visited this page'),
            statusCode: 400,
          };
        }

        return { success: true, data: visitorInfoToDomain(record[0] as VisitorInfoSelect) };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },

    createVisitorInfo: async (
      { ipHash, todayKST, pathName, userAgent }: GetVisitorInfoParams,
      tx: Transaction
    ) => {
      try {
        const newRecord = await tx
          .insert(visitorInfo)
          .values({
            ipHash,
            date: todayKST,
            visitedPathnames: [pathName],
            userAgent: userAgent,
          })
          .returning();

        return { success: true, data: visitorInfoToDomain(newRecord[0] as VisitorInfoSelect) };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },

    updateVisitorPathname: async (
      data: VisitorInfo,
      pathName: string,
      todayKST: string,
      tx: Transaction
    ) => {
      try {
        const updatedVisitedPathnames = data.visitedPathnames.includes(pathName)
          ? data.visitedPathnames
          : [...data.visitedPathnames, pathName];

        const record = await tx
          .update(visitorInfo)
          .set({ visitedPathnames: updatedVisitedPathnames })
          .where(and(eq(visitorInfo.ipHash, data.ipHash), eq(visitorInfo.date, todayKST)))
          .returning();

        if (record.length === 0) {
          return { success: false, error: new Error('Visitor info not found') };
        }

        return { success: true, data: visitorInfoToDomain(record[0] as VisitorInfoSelect) };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
  };
};

export default createVisitorInfoRepositoryAdapter;
