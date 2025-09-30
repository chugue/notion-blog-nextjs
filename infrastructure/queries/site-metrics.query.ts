import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { dateToStringYYYYMMDD, getADayBefore, getKstDate } from '@/shared/utils/format-date';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';
import { SiteMetricSelect, siteMetricToDomain, siteMetrics } from '../database/supabase/schema';

export const siteMetricsQuery = {
  createCronTodayMetrics: async (
    yesterdayMetrics: SiteMetric,
    todayKST: Date,
    tx: Transaction
  ): Promise<SiteMetric | null> => {
    const newTodayMetrics = await tx
      .insert(siteMetrics)
      .values({
        date: dateToStringYYYYMMDD(todayKST),
        totalVisits: yesterdayMetrics.totalVisits,
        dailyVisits: 0,
      })
      .returning();
    return siteMetricToDomain(newTodayMetrics[0] as SiteMetricSelect);
  },
  createWithYesterdayMetrics: async (
    yesterdayMetrics: SiteMetric,
    todayKST: Date,
    tx: Transaction
  ): Promise<SiteMetric | null> => {
    todayKST.setHours(0, 0, 0, 0);
    const newTodayMetrics = await tx
      .insert(siteMetrics)
      .values({
        date: dateToStringYYYYMMDD(todayKST),
        totalVisits: sql`${yesterdayMetrics.totalVisits} + 1`,
        dailyVisits: 1,
      })
      .returning();
    return siteMetricToDomain(newTodayMetrics[0] as SiteMetricSelect);
  },

  // 어제 날짜 데이터 조회
  getYesterDaySiteMetrics: async (tx?: Transaction): Promise<SiteMetric | null> => {
    try {
      const kstTime = getKstDate();
      const yesterday = getADayBefore(kstTime);
      const yesterdayDate = dateToStringYYYYMMDD(yesterday);

      if (!tx) {
        const yesterdaySiteMetrics = await db
          .select()
          .from(siteMetrics)
          .where(eq(siteMetrics.date, yesterdayDate))
          .limit(1);
        return siteMetricToDomain(yesterdaySiteMetrics[0]);
      }
      const yesterdaySiteMetrics = await tx
        .select()
        .from(siteMetrics)
        .where(eq(siteMetrics.date, yesterdayDate))
        .limit(1);
      return siteMetricToDomain(yesterdaySiteMetrics[0]);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  // 오늘 날짜 데이터 조회
  getSiteMetricsByDate: async (date: Date, tx: Transaction): Promise<SiteMetric | null> => {
    const dateString = dateToStringYYYYMMDD(date);
    try {
      // 오늘 날짜 데이터 조회
      const siteMetricData = await tx
        .select()
        .from(siteMetrics)
        .where(eq(siteMetrics.date, dateString))
        .limit(1);

      // 오늘 날짜 데이터가 있으면 조회수 추가
      if (siteMetricData.length === 0) return null;

      return siteMetricToDomain(siteMetricData[0] as SiteMetricSelect);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  // 메인페이지 30일 데이터 조회
  getSiteMetricsByDateRange: async (startDate: string, endDate: string): Promise<SiteMetric[]> => {
    try {
      const siteMetricData = await db
        .select()
        .from(siteMetrics)
        .where(and(gte(siteMetrics.date, startDate), lte(siteMetrics.date, endDate)))
        .orderBy(siteMetrics.date);

      return siteMetricData.map(siteMetricToDomain);
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  // 페이지 전체 조회후 SiteMetric 생성
  createSiteMetrics: async (
    date: Date,
    tx: Transaction,
    totalVisits: number
  ): Promise<SiteMetric | null> => {
    const dateString = dateToStringYYYYMMDD(date);
    const newSiteMetrics = await tx
      .insert(siteMetrics)
      .values({ date: dateString, totalVisits: sql`${totalVisits} + 1`, dailyVisits: 1 })
      .returning();

    if (!newSiteMetrics) return null;

    return siteMetricToDomain(newSiteMetrics[0] as SiteMetricSelect);
  },

  updateMetrics: async (siteMetric: SiteMetric): Promise<SiteMetric | null> => {
    try {
      const { id, date, totalVisits, dailyVisits } = siteMetric;

      // 3. 있으면 조회수 증가 : 오늘 날짜 + 총 방문수
      const updatedMetrics = await db
        .update(siteMetrics)
        .set({
          totalVisits: sql`${totalVisits} + 1`,
          dailyVisits: sql`${dailyVisits} + 1`,
        })
        .where(and(eq(siteMetrics.id, id), eq(siteMetrics.date, date)))
        .returning();

      return siteMetricToDomain(updatedMetrics[0] as SiteMetricSelect);
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
