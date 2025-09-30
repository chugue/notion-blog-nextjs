import {
  VisitorInfoSelect,
  visitorInfo,
  visitorInfoToDomain,
} from '@/infrastructure/database/supabase/schema';
import { dateToStringYYYYMMDD } from '@/shared/utils/format-date';
import { and, eq } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';

const visitorInfoQuery = {
  getVisitorInfo: async (ipHash: string, date: Date) => {
    try {
      const record = await db.query.visitorInfo.findFirst({
        where: and(
          eq(visitorInfo.ipHash, ipHash),
          eq(visitorInfo.date, dateToStringYYYYMMDD(date))
        ),
      });
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  },

  getAllVisitorsByDate: async (date: Date, tx: Transaction) => {
    try {
      const record = await tx
        .select()
        .from(visitorInfo)
        .where(eq(visitorInfo.date, dateToStringYYYYMMDD(date)));
      return record.map((visitor) => visitorInfoToDomain(visitor as VisitorInfoSelect));
    } catch (error) {
      console.log(error);
      return [];
    }
  },
};

export default visitorInfoQuery;
