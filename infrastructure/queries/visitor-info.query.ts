import {
  VisitorInfoSelect,
  visitorInfo,
  visitorInfoToDomain,
} from '@/infrastructure/database/supabase/schema';
import { getStartEndOfDay } from '@/shared/utils/format-date';
import { and, between, eq } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';

const visitorInfoQuery = {
  getVisitorInfo: async (ipHash: string, date: Date) => {
    try {
      const startOfDay = date;
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = date;
      endOfDay.setHours(23, 59, 59, 999);

      const record = await db.query.visitorInfo.findFirst({
        where: and(eq(visitorInfo.ipHash, ipHash), between(visitorInfo.date, startOfDay, endOfDay)),
      });
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  },

  getAllVisitorsByDate: async (todayKST: Date, tx: Transaction) => {
    try {
      const { startOfDay, endOfDay } = getStartEndOfDay(todayKST);

      const record = await tx
        .select()
        .from(visitorInfo)
        .where(between(visitorInfo.date, startOfDay, endOfDay));
      return record.map((visitor) => visitorInfoToDomain(visitor as VisitorInfoSelect));
    } catch (error) {
      console.log(error);
      return [];
    }
  },
};

export default visitorInfoQuery;
