import { PageView } from '@/domain/entities/page-view.entity';
import { Transaction, db } from '@/infrastructure/database/drizzle/drizzle';
import {
  PageViewSelect,
  pageViewToDomain,
  pageViews,
} from '@/infrastructure/database/supabase/schema';
import { Result } from '@/shared/types/result';
import { and, eq, sql } from 'drizzle-orm';

export const pageViewQuery = {
  getMainPageView: async (): Promise<Result<PageView, Error>> => {
    try {
      const record = await db.query.pageViews.findFirst({
        where: and(eq(pageViews.notionPageId, 'main')),
      });

      if (!record) return { success: false, error: new Error('page view not found') };

      return { success: true, data: pageViewToDomain(record) };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
    }
  },

  pageViewQuery: async (pathname: string, tx: Transaction): Promise<PageView | undefined> => {
    try {
      const record = await tx
        .select()
        .from(pageViews)
        .where(and(eq(pageViews.pathname, pathname)))
        .limit(1);

      if (record.length === 0) return undefined;

      return pageViewToDomain(record[0] as PageViewSelect);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  },

  pageViewInsertAndReturn: async (
    pageId: string,
    pathname: string,
    tx: Transaction
  ): Promise<PageViewSelect[]> => {
    try {
      return await tx
        .insert(pageViews)
        .values({
          notionPageId: pageId,
          pathname,
          viewCount: 0,
          likeCount: 0,
        })
        .returning();
    } catch (error) {
      console.log(error);
      return [];
    }
  },

  updatePageView: async (pageView: PageView, tx: Transaction): Promise<Result<PageView, Error>> => {
    try {
      const updatedRecord = await tx
        .update(pageViews)
        .set({ viewCount: sql`${pageViews.viewCount} + 1`, likeCount: sql`${pageViews.likeCount}` })
        .where(
          and(
            eq(pageViews.notionPageId, pageView.notionPageId),
            eq(pageViews.pathname, pageView.pathname)
          )
        )
        .returning();

      return { success: true, data: pageViewToDomain(updatedRecord[0] as PageViewSelect) };
    } catch (error) {
      console.log(error);
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  },

  getAllPageViews: async (tx: Transaction): Promise<PageView[]> => {
    try {
      const allPageViews = await tx.select().from(pageViews);

      if (allPageViews.length === 0) return [];

      return allPageViews.map((pageView) => pageViewToDomain(pageView as PageViewSelect));
    } catch (error) {
      console.log(error);
      return [];
    }
  },
};
