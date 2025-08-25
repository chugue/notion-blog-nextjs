export interface PageViewUseCasePort {
  readonly addMainPageView: (request: Promise<Headers>) => Promise<void>;
  readonly addDetailPageView: (pageId: string) => Promise<void>;
  readonly addAboutPageView: (pageId: string) => Promise<void>;
}
