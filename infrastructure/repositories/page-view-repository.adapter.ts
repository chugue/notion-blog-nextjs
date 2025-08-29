import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { PageView } from '@/domain/entities/page-view.entity';
import { Result } from '@/shared/types/result';
import { Transaction } from '../database/drizzle/drizzle';
import { PageViewSelect, pageViewToDomain } from '../database/supabase/schema';
import { pageViewQuery } from '../queries/page-views.query';

export const createPageViewRepositoryAdapter = (): PageViewRepositoryPort => {
  return {
    addDetailPageView: async (pageId: string): Promise<void> => {},

    addMainPageView: async (pageId: string): Promise<void> => {},

    addAboutPageView: async (pageId: string): Promise<void> => {},

    getAllPageViews: async (tx: Transaction): Promise<Result<PageView[], Error>> => {
      try {
        const pageViews = await pageViewQuery.getAllPageViews(tx);

        if (pageViews.length === 0)
          return { success: false, error: new Error('Failed to get page views') };

        return { success: true, data: pageViews };
      } catch (error) {
        console.log(error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }
    },

    getPageViewOrCreate: async (
      date: string,
      pageId: string,
      pathname: string,
      tx: Transaction
    ): Promise<Result<PageView, Error>> => {
      try {
        const queryResult = await pageViewQuery.pageViewQuery(date, pathname, tx);

        if (!queryResult) {
          const newRecord = await pageViewQuery.pageViewInsertAndReturn(date, pageId, pathname, tx);

          if (!newRecord) {
            return { success: false, error: new Error('Failed to create page view') };
          }

          return { success: true, data: pageViewToDomain(newRecord[0] as PageViewSelect) };
        }

        return { success: true, data: pageViewToDomain(queryResult as PageViewSelect) };
      } catch (error) {
        console.log(error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }
    },

    updatePageView: async (
      pageView: PageView,
      tx: Transaction
    ): Promise<Result<PageView, Error>> => {
      try {
        const updatedRecord = await pageViewQuery.updatePageView(pageView, tx);

        if (!updatedRecord.success) {
          return { success: false, error: updatedRecord.error };
        }

        return { success: true, data: updatedRecord.data };
      } catch (error) {
        console.log(error);
        return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
      }
    },
  };
};
