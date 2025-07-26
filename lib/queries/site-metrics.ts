import { db } from '../drizzle/drizzle';
import { eq } from 'drizzle-orm';
import { siteMetrics } from '../schema';

export const updateMetrics = async (date: string) => {
  try {
    const existingMetrics = await db.query.siteMetrics.findFirst({
      where: eq(siteMetrics.date, date),
    });

    if (existingMetrics) {
      await db
        .update(siteMetrics)
        .set({ totalVisits: (existingMetrics.totalVisits ?? 0) + 1 })
        .where(eq(siteMetrics.id, existingMetrics.id));
    }

    const prevTotalVisits = await getTotalVisits();

    await db.insert(siteMetrics).values({ date, totalVisits: prevTotalVisits + 1, dailyVisits: 1 });
  } catch (error) {
    console.log(error);
  }
};

export const getTotalVisits = async () => {
  let totalVisits = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split('T')[0];

  // 오늘 날짜 데이터 조회
  const todayMetrics = await db.query.siteMetrics.findFirst({
    where: eq(siteMetrics.date, today),
  });

  // 오늘 날짜 데이터가 있으면 조회수 추가
  if (todayMetrics) totalVisits = todayMetrics.totalVisits ?? 0;

  // 어제 날짜 데이터 조회
  const yesterdayMetrics = await db.query.siteMetrics.findFirst({
    where: eq(siteMetrics.date, yesterday),
  });

  // 어제 날짜 데이터가 있으면 조회수 반환
  if (yesterdayMetrics) totalVisits = yesterdayMetrics.totalVisits ?? 0;

  return totalVisits;
};
