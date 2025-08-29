export interface PageViewUseCasePort {
  readonly addMainPageView: (request: Promise<Headers>) => Promise<void>;
  readonly addDetailPageView: (request: Promise<Headers>, pageId: string) => Promise<void>;
  readonly addAboutPageView: (request: Promise<Headers>, pageId: string) => Promise<void>;
}
