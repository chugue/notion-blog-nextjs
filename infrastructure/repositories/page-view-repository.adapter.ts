'use server';

import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { PageView } from '@/domain/entities/page-view.entity';
import { Result } from '@/shared/types/result';
import { pageViewQuery } from '../queries/page-views.query';

export const createPageViewRepositoryAdapter = (): PageViewRepositoryPort => {
  return {
    addDetailPageView: async (pageId: string): Promise<void> => {},

    addMainPageView: async (pageId: string): Promise<void> => {},

    addAboutPageView: async (pageId: string): Promise<void> => {},

    getPageViewIfNotCreate: async (
      date: string,
      pageId: string,
      pathname: string
    ): Promise<Result<PageView, Error>> => {
      try {
        pageViewQuery;
      } catch (error) {
        console.log(error);
      }
    },
  };
};
