'use server';

import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { PageView } from '@/domain/entities/page-view.entity';
import { Result } from '@/shared/types/result';
import { PageViewSelect, pageViewToDomain } from '../database/supabase/schema';
import { pageViewQuery } from '../queries/page-views.query';

export const createPageViewRepositoryAdapter = (): PageViewRepositoryPort => {
  return {
    addDetailPageView: async (pageId: string): Promise<void> => {},

    addMainPageView: async (pageId: string): Promise<void> => {},

    addAboutPageView: async (pageId: string): Promise<void> => {},

    getPageViewOrCreate: async (
      date: string,
      pageId: string,
      pathname: string
    ): Promise<Result<PageView, Error>> => {
      try {
        const queryResult = await pageViewQuery.pageViewQuery(date, pageId, pathname);

        if (!queryResult) {
          const newRecord = await pageViewQuery.pageViewInsertAndReturn(date, pageId, pathname);

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
  };
};
