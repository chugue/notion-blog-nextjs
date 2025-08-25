import { visitorInfo } from '@/infrastructure/database/supabase/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '../database/drizzle/drizzle';

const visitorInfoQuery = () => {
  return {
    getVisitorInfo: async (ipHash: string, date: string) => {
      try {
        const record = await db.query.visitorInfo.findFirst({
          where: and(eq(visitorInfo.ipHash, ipHash), eq(visitorInfo.date, date)),
        });
        return { success: true, data: record };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
  };
};

export default visitorInfoQuery;
