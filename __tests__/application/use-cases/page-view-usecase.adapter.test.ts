import { jest } from '@jest/globals';
import type { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import type { SiteMetricsRepositoryPort } from '@/application/port/site-metrics-repository.port';
import type { VisitorInfoRepositoryPort } from '@/application/port/visitor-info-repository.port';
import type { PageView } from '@/domain/entities/page-view.entity';
import type { SiteMetric } from '@/domain/entities/site-metric.entity';
import type { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import type { Transaction } from '@/infrastructure/database/drizzle/drizzle';

// ESM 환경에서는 jest.mock 호이스팅이 없으므로 unstable_mockModule + 동적 import를 사용합니다.
type TransactionCallback = (tx: Transaction) => Promise<void>;

const mockTransaction = jest.fn<(cb: TransactionCallback) => Promise<void>>();
const mockCrawlingBotCheck = jest.fn<(userAgent: string) => boolean>();
const mockHashIp = jest.fn<(ip: string) => Promise<string>>();
const mockCheckCookies = jest.fn<() => Promise<boolean>>();

jest.unstable_mockModule('@/infrastructure/database/drizzle/drizzle', () => ({
  db: { transaction: mockTransaction },
}));

jest.unstable_mockModule('@/domain/utils/page-view.utils', () => ({
  crawlingBotCheck: mockCrawlingBotCheck,
}));

jest.unstable_mockModule('@/domain/utils/crypto.utils', () => ({
  hashIp: mockHashIp,
}));

jest.unstable_mockModule('@/presentation/utils/cookie-utils', () => ({
  checkCookies: mockCheckCookies,
}));

const { createPageViewUseCaseAdapter } = await import(
  '@/application/use-cases/page-view-usecase.adapter'
);

// Mocks for repository ports
const mockPageViewRepo: jest.Mocked<PageViewRepositoryPort> = {
  addAboutPageView: jest.fn<PageViewRepositoryPort['addAboutPageView']>(),
  addDetailPageView: jest.fn<PageViewRepositoryPort['addDetailPageView']>(),
  addMainPageView: jest.fn<PageViewRepositoryPort['addMainPageView']>(),
  getAllPageViews: jest.fn<PageViewRepositoryPort['getAllPageViews']>(),
  getPageViewOrCreate: jest.fn<PageViewRepositoryPort['getPageViewOrCreate']>(),
  updatePageView: jest.fn<PageViewRepositoryPort['updatePageView']>(),
};

const mockVisitorInfoRepo: jest.Mocked<VisitorInfoRepositoryPort> = {
  getVisitorInfoOrCreate: jest.fn<VisitorInfoRepositoryPort['getVisitorInfoOrCreate']>(),
  createVisitorInfo: jest.fn<VisitorInfoRepositoryPort['createVisitorInfo']>(),
  updateVisitorPathname: jest.fn<VisitorInfoRepositoryPort['updateVisitorPathname']>(),
};

const mockSiteMetricRepo: jest.Mocked<SiteMetricsRepositoryPort> = {
  getSiteMetricsByDateRange: jest.fn<SiteMetricsRepositoryPort['getSiteMetricsByDateRange']>(),
  updateSiteMetric: jest.fn<SiteMetricsRepositoryPort['updateSiteMetric']>(),
};

// Fixtures
const tx = {} as Transaction;

const mockVisitorInfo: VisitorInfo = {
  id: 'some-id',
  ipHash: 'mock-ip-hash',
  userAgent: 'Mozilla/5.0',
  date: '2023-01-01',
  visitedPathnames: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSiteMetric: SiteMetric = {
  id: 'site-metric-id',
  date: '2023-01-01',
  totalVisits: 1,
  dailyVisits: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockPageView = (notionPageId: string, pathname: string): PageView => ({
  id: 'page-view-id',
  notionPageId,
  pathname,
  viewCount: 1,
  likeCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createHeaders = (userAgent = 'Mozilla/5.0', ip = '1.2.3.4'): Promise<Headers> =>
  Promise.resolve(new Headers({ 'user-agent': userAgent, 'x-forwarded-for': ip }));

const createAdapter = () =>
  createPageViewUseCaseAdapter(mockPageViewRepo, mockVisitorInfoRepo, mockSiteMetricRepo);

// 트랜잭션 안에서 호출되는 저장소 메서드 (각 유즈케이스의 실제 호출 순서대로)
const repoSteps = {
  getVisitorInfoOrCreate: mockVisitorInfoRepo.getVisitorInfoOrCreate,
  updateVisitorPathname: mockVisitorInfoRepo.updateVisitorPathname,
  getPageViewOrCreate: mockPageViewRepo.getPageViewOrCreate,
  updatePageView: mockPageViewRepo.updatePageView,
  updateSiteMetric: mockSiteMetricRepo.updateSiteMetric,
} as const;

type RepoStep = keyof typeof repoSteps;

interface UseCaseScenario {
  readonly name: string;
  readonly pageId: string;
  readonly pathname: string;
  readonly callOrder: readonly RepoStep[];
  readonly run: (
    adapter: ReturnType<typeof createPageViewUseCaseAdapter>,
    headers: Promise<Headers>
  ) => Promise<void>;
}

const scenarios: UseCaseScenario[] = [
  {
    name: 'addMainPageView',
    pageId: 'main',
    pathname: '/',
    callOrder: [
      'getVisitorInfoOrCreate',
      'updateVisitorPathname',
      'getPageViewOrCreate',
      'updatePageView',
      'updateSiteMetric',
    ],
    run: (adapter, headers) => adapter.addMainPageView(headers),
  },
  {
    name: 'addDetailPageView',
    pageId: 'post-123',
    pathname: 'blog/post-123',
    callOrder: [
      'getVisitorInfoOrCreate',
      'getPageViewOrCreate',
      'updatePageView',
      'updateVisitorPathname',
      'updateSiteMetric',
    ],
    run: (adapter, headers) => adapter.addDetailPageView(headers, 'post-123'),
  },
  {
    name: 'addAboutPageView',
    pageId: 'about',
    pathname: '/about',
    callOrder: [
      'getVisitorInfoOrCreate',
      'getPageViewOrCreate',
      'updatePageView',
      'updateVisitorPathname',
      'updateSiteMetric',
    ],
    run: (adapter, headers) => adapter.addAboutPageView(headers, 'about'),
  },
];

const setupHappyPath = (pageId: string, pathname: string) => {
  const mockPageView = createMockPageView(pageId, pathname);

  mockCrawlingBotCheck.mockReturnValue(false);
  mockHashIp.mockResolvedValue('mock-ip-hash');
  mockCheckCookies.mockResolvedValue(true);
  mockTransaction.mockImplementation(async (cb) => cb(tx));

  mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
    success: true,
    data: mockVisitorInfo,
  });
  mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
    success: true,
    data: mockVisitorInfo,
  });
  mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({ success: true, data: mockPageView });
  mockPageViewRepo.updatePageView.mockResolvedValue({ success: true, data: mockPageView });
  mockSiteMetricRepo.updateSiteMetric.mockResolvedValue({ success: true, data: mockSiteMetric });

  return { mockPageView };
};

const expectStepsNotCalledAfter = (callOrder: readonly RepoStep[], failedStep: RepoStep) => {
  const failedIndex = callOrder.indexOf(failedStep);

  callOrder.slice(failedIndex + 1).forEach((step) => {
    expect(repoSteps[step]).not.toHaveBeenCalled();
  });
};

describe.each(scenarios)('$name use case', ({ pageId, pathname, callOrder, run }) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return early for crawling bots', async () => {
    mockCrawlingBotCheck.mockReturnValue(true);

    await run(createAdapter(), createHeaders('Googlebot'));

    expect(mockCrawlingBotCheck).toHaveBeenCalledWith('Googlebot');
    expect(mockHashIp).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('should run transaction and call repos on normal request', async () => {
    const { mockPageView } = setupHappyPath(pageId, pathname);

    await run(createAdapter(), createHeaders());

    expect(mockCrawlingBotCheck).toHaveBeenCalledWith('Mozilla/5.0');
    expect(mockHashIp).toHaveBeenCalledWith('1.2.3.4');
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledWith(
      {
        ipHash: 'mock-ip-hash',
        todayKST: expect.any(Date),
        pathname,
        userAgent: 'Mozilla/5.0',
      },
      tx
    );
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalledWith(
      mockVisitorInfo,
      pathname,
      expect.any(Date),
      tx
    );
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalledWith(pageId, pathname, tx);
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalledWith(mockPageView, tx);
    expect(mockCheckCookies).toHaveBeenCalledTimes(1);
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalledWith(
      expect.any(Date),
      mockVisitorInfo,
      tx
    );
  });

  it('should fall back to "unknown" ip and user-agent when headers are missing', async () => {
    setupHappyPath(pageId, pathname);

    await run(createAdapter(), Promise.resolve(new Headers()));

    expect(mockCrawlingBotCheck).toHaveBeenCalledWith('unknown');
    expect(mockHashIp).toHaveBeenCalledWith('unknown');
    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userAgent: 'unknown' }),
      tx
    );
  });

  it('should skip updateSiteMetric for a returning visitor (cookie already set today)', async () => {
    setupHappyPath(pageId, pathname);
    mockCheckCookies.mockResolvedValue(false);

    await run(createAdapter(), createHeaders());

    expect(mockPageViewRepo.updatePageView).toHaveBeenCalledTimes(1);
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalledTimes(1);
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should return early if getVisitorInfoOrCreate fails with status code 400', async () => {
    setupHappyPath(pageId, pathname);
    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      statusCode: 400,
      error: new Error('Bad request'),
    });

    await run(createAdapter(), createHeaders());

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledTimes(1);
    expectStepsNotCalledAfter(callOrder, 'getVisitorInfoOrCreate');
  });

  it('should throw error if getVisitorInfoOrCreate fails without status code 400', async () => {
    setupHappyPath(pageId, pathname);
    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Some other error'),
    });

    await expect(run(createAdapter(), createHeaders())).rejects.toThrow('Some other error');

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledTimes(1);
    expectStepsNotCalledAfter(callOrder, 'getVisitorInfoOrCreate');
  });

  it('should throw error if updateVisitorPathname fails', async () => {
    setupHappyPath(pageId, pathname);
    mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
      success: false,
      error: new Error('Update visitor failed'),
    });

    await expect(run(createAdapter(), createHeaders())).rejects.toThrow('Update visitor failed');

    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalledTimes(1);
    expectStepsNotCalledAfter(callOrder, 'updateVisitorPathname');
  });

  it('should throw error if getPageViewOrCreate fails', async () => {
    setupHappyPath(pageId, pathname);
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Get page view failed'),
    });

    await expect(run(createAdapter(), createHeaders())).rejects.toThrow('Get page view failed');

    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalledTimes(1);
    expectStepsNotCalledAfter(callOrder, 'getPageViewOrCreate');
  });

  it('should throw error if updatePageView fails', async () => {
    setupHappyPath(pageId, pathname);
    mockPageViewRepo.updatePageView.mockResolvedValue({
      success: false,
      error: new Error('Update page view failed'),
    });

    await expect(run(createAdapter(), createHeaders())).rejects.toThrow('Update page view failed');

    expect(mockPageViewRepo.updatePageView).toHaveBeenCalledTimes(1);
    expectStepsNotCalledAfter(callOrder, 'updatePageView');
  });

  it('should throw error if updateSiteMetric fails', async () => {
    setupHappyPath(pageId, pathname);
    mockSiteMetricRepo.updateSiteMetric.mockResolvedValue({
      success: false,
      error: new Error('Update site metric failed'),
    });

    await expect(run(createAdapter(), createHeaders())).rejects.toThrow(
      'Update site metric failed'
    );

    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalledTimes(1);
  });
});
