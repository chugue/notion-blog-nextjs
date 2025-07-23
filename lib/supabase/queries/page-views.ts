import { updateMetrics } from './site-metrics';
import { db } from '@/lib/supabase/drizzle/drizzle';
import { pageViews } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';

export const createPageView = async (notionPageId: string) => {
  try {
    const existingPageView = await db.query.pageViews.findFirst({
      where: eq(pageViews.notionPageId, notionPageId),
    });

    if (existingPageView) {
      await db
        .update(pageViews)
        .set({ viewCount: (existingPageView.viewCount ?? 0) + 1 })
        .where(eq(pageViews.id, existingPageView.id));
      return existingPageView;
    }

    const pageView = await db
      .insert(pageViews)
      .values({ notionPageId, pathname: `/blog/${notionPageId}`, viewCount: 1 })
      .returning();

    await updateMetrics(new Date().toISOString().split('T')[0]);

    return pageView;
  } catch (error) {
    console.log(error);
    return null;
  }
};
