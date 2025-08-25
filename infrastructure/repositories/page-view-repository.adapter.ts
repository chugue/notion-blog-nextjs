import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { PageView } from '@/domain/entities/page-view.entity';

export const createPageViewRepositoryAdapter = (): PageViewRepositoryPort => {
  return {
    addDetailPageView: async (pageId: string): Promise<void> => {},

    addMainPageView: async (pageId: string): Promise<void> => {},

    addAboutPageView: async (pageId: string): Promise<void> => {},

    getMainPageView: async (): Promise<PageView> => {
      return {
        notionPageId: 'main',
        pathname: '/',
        viewCount: 0,
      };
    },
  };
};
