import { PageView } from '@/domain/entities/page-view.entity';

export interface PageViewRepositoryPort {
  readonly addDetailPageView: (pageId: string) => Promise<void>;
  readonly addMainPageView: (pageId: string) => Promise<void>;
  readonly addAboutPageView: (pageId: string) => Promise<void>;
  readonly getMainPageView: () => Promise<PageView>;
}
