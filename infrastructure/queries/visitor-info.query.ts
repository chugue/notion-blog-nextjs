import {
  VisitorInfoSelect,
  visitorInfo,
  visitorInfoToDomain,
} from '@/infrastructure/database/supabase/schema';
import { and, eq } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';

const visitorInfoQuery = {
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

  getAllVisitorsByDate: async (todayKST: string, tx: Transaction) => {
    try {
      const record = await tx.select().from(visitorInfo).where(eq(visitorInfo.date, todayKST));
      return record.map((visitor) => visitorInfoToDomain(visitor as VisitorInfoSelect));
    } catch (error) {
      console.log(error);
      return [];
    }
  },
};

export default visitorInfoQuery;
