import { PageView } from '@/domain/entities/page-view.entity';
import { db } from '@/infrastructure/database/drizzle/drizzle';
import { pageViewToDomain, pageViews } from '@/infrastructure/database/supabase/schema';
import { Result } from '@/shared/types/result';
import { and, eq } from 'drizzle-orm';

export const pageViewQuery = () => {
  return {
    getMainPageView: async (): Promise<Result<PageView, Error>> => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const record = await db.query.pageViews.findFirst({
          where: and(eq(pageViews.notionPageId, 'main'), eq(pageViews.date, today)),
        });

        if (!record) return { success: false, error: new Error('page view not found') };

        return { success: true, data: pageViewToDomain(record) };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
  };
};
