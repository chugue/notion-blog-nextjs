import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { and, eq } from 'drizzle-orm';
import { Transaction, db } from '../database/drizzle/drizzle';
import { SiteMetricSelect, siteMetricToDomain, siteMetrics } from '../database/supabase/schema';

export const siteMetricsQuery = {
  getYesterDaySiteMetrics: async (): Promise<SiteMetric | null> => {
    try {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0];

      const yesterdaySiteMetrics = await db.query.siteMetrics.findFirst({
        where: eq(siteMetrics.date, yesterday),
      });
      return siteMetricToDomain(yesterdaySiteMetrics as SiteMetricSelect);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getSiteMetricsByDate: async (date: string, tx: Transaction): Promise<SiteMetric | null> => {
    try {
      // 오늘 날짜 데이터 조회
      const siteMetricData = await tx
        .select()
        .from(siteMetrics)
        .where(eq(siteMetrics.date, date))
        .limit(1);

      // 오늘 날짜 데이터가 있으면 조회수 추가
      if (siteMetricData.length === 0) return null;

      return siteMetricToDomain(siteMetricData[0] as SiteMetricSelect);
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  createSiteMetrics: async (date: string, totalVisits?: number): Promise<SiteMetric | null> => {
    const newSiteMetrics = await db
      .insert(siteMetrics)
      .values({ date, totalVisits: totalVisits ? totalVisits + 1 : 1, dailyVisits: 1 })
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
          totalVisits: totalVisits + 1,
          dailyVisits: dailyVisits + 1,
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
