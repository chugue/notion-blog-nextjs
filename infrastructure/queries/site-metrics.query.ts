import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { getStartEndOfDay } from '@/shared/utils/format-date';
import { and, between, eq, gte, lte, sql } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';
import { SiteMetricSelect, siteMetricToDomain, siteMetrics } from '../database/supabase/schema';

export const siteMetricsQuery = {
  createWithYesterdayMetrics: async (
    yesterdayMetrics: SiteMetric,
    todayKST: Date,
    tx: Transaction
  ): Promise<SiteMetric | null> => {
    const newTodayMetrics = await tx.insert(siteMetrics).values({
      date: todayKST,
      totalVisits: sql`${yesterdayMetrics.totalVisits} + 1`,
      dailyVisits: 1,
    });
    return siteMetricToDomain(newTodayMetrics[0] as SiteMetricSelect);
  },

  // 어제 날짜 데이터 조회
  getYesterDaySiteMetrics: async (): Promise<SiteMetric | null> => {
    try {
      const now = new Date();
      const kstOffset = 9 * 60; // KST는 UTC+9
      const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);
      const yesterday = new Date(kstTime.setDate(kstTime.getDate() - 1));

      const yesterdaySiteMetrics = await db.query.siteMetrics.findFirst({
        where: eq(siteMetrics.date, yesterday),
      });
      return siteMetricToDomain(yesterdaySiteMetrics as SiteMetricSelect);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  // 오늘 날짜 데이터 조회
  getSiteMetricsByDate: async (date: Date, tx: Transaction): Promise<SiteMetric | null> => {
    try {
      const { startOfDay, endOfDay } = getStartEndOfDay(date);
      // 오늘 날짜 데이터 조회
      const siteMetricData = await tx
        .select()
        .from(siteMetrics)
        .where(between(siteMetrics.date, startOfDay, endOfDay))
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
  getSiteMetricsByDateRange: async (startDate: Date, endDate: Date): Promise<SiteMetric[]> => {
    try {
      const siteMetricData = await db
        .select()
        .from(siteMetrics)
        .where(and(gte(siteMetrics.date, startDate), lte(siteMetrics.date, endDate)));

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
    const newSiteMetrics = await tx
      .insert(siteMetrics)
      .values({ date, totalVisits: sql`${totalVisits} + 1`, dailyVisits: 1 })
      .returning();

    if (!newSiteMetrics) return null;

    return siteMetricToDomain(newSiteMetrics[0] as SiteMetricSelect);
  },

  updateMetrics: async (siteMetric: SiteMetric): Promise<SiteMetric | null> => {
    try {
      const { id, date, totalVisits, dailyVisits } = siteMetric;
      const { startOfDay, endOfDay } = getStartEndOfDay(date);

      // 3. 있으면 조회수 증가 : 오늘 날짜 + 총 방문수
      const updatedMetrics = await db
        .update(siteMetrics)
        .set({
          totalVisits: sql`${totalVisits} + 1`,
          dailyVisits: sql`${dailyVisits} + 1`,
        })
        .where(and(eq(siteMetrics.id, id), between(siteMetrics.date, startOfDay, endOfDay)))
        .returning();

      return siteMetricToDomain(updatedMetrics[0] as SiteMetricSelect);
    } catch (error) {
      console.log(error);
      return null;
    }
  },
};
