import { PageView } from '@/domain/entities/page-view.entity';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';
import { Result } from '@/shared/types/result';

export interface PageViewRepositoryPort {
  readonly addDetailPageView: (pageId: string) => Promise<void>;
  readonly addMainPageView: (pageId: string) => Promise<void>;
  readonly addAboutPageView: (pageId: string) => Promise<void>;
  readonly getAllPageViews: (tx: Transaction) => Promise<Result<PageView[], Error>>;
  readonly getPageViewOrCreate: (
    date: string,
    pageId: string,
    pathname: string,
    tx: Transaction
  ) => Promise<Result<PageView, Error>>;
  readonly updatePageView: (
    pageView: PageView,
    tx: Transaction
  ) => Promise<Result<PageView, Error>>;
}
