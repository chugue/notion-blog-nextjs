import { VisitorInfoRepositoryPort } from '@/application/port/visitor-info-repository.port';
import { and, eq } from 'drizzle-orm';
import { db } from '../database/drizzle/drizzle';
import { VisitorInfoSelect, visitorInfo, visitorInfoToDomain } from '../database/supabase/schema';

const createVisitorInfoRepositoryAdapter = (): VisitorInfoRepositoryPort => {
  return {
    getVisitorInfoOrCreate: async (
      ipHash: string,
      date: string,
      pathname: string,
      userAgent: string
    ) => {
      try {
        const record = await db.query.visitorInfo.findFirst({
          where: and(eq(visitorInfo.ipHash, ipHash), eq(visitorInfo.date, date)),
        });

        if (!record) {
          const newRecord = await db
            .insert(visitorInfo)
            .values({
              ipHash,
              date,
              visitedPathnames: [pathname],
              userAgent: userAgent,
            })
            .returning();

          return { success: true, data: visitorInfoToDomain(newRecord[0] as VisitorInfoSelect) };
        }

        return { success: true, data: visitorInfoToDomain(record as VisitorInfoSelect) };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
  };
};

export default createVisitorInfoRepositoryAdapter;
