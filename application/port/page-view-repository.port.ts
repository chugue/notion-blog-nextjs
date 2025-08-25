import { PageView } from '@/domain/entities/page-view.entity';
import { Result } from '@/shared/types/result';

export interface PageViewRepositoryPort {
  readonly addDetailPageView: (pageId: string) => Promise<void>;
  readonly addMainPageView: (pageId: string) => Promise<void>;
  readonly addAboutPageView: (pageId: string) => Promise<void>;
  readonly getPageViewIfNotCreate: (
    date: string,
    pageId: string,
    pathname: string
  ) => Promise<Result<PageView, Error>>;
}
