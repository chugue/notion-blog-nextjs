import { PageView } from '@/domain/entities/page-view.entity';
import { db } from '@/infrastructure/database/drizzle/drizzle';
import {
  PageViewSelect,
  pageViewToDomain,
  pageViews,
} from '@/infrastructure/database/supabase/schema';
import { Result } from '@/shared/types/result';
import { and, eq } from 'drizzle-orm';

export const pageViewQuery = {
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

  pageViewQuery: async (
    date: string,
    pageId: string,
    pathname: string
  ): Promise<PageViewSelect | undefined> => {
    try {
      return await db.query.pageViews.findFirst({
        where: and(
          eq(pageViews.date, date),
          eq(pageViews.notionPageId, pageId),
          eq(pageViews.pathname, pathname)
        ),
      });
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },

  pageViewInsertAndReturn: async (
    date: string,
    pageId: string,
    pathname: string
  ): Promise<PageViewSelect[]> => {
    try {
      return await db
        .insert(pageViews)
        .values({
          date,
          notionPageId: pageId,
          pathname,
          viewCount: 1,
          likeCount: 0,
        })
        .returning();
    } catch (error) {
      console.log(error);
      return [];
    }
  },
};
