global.crypto = {
  subtle: {
    digest: jest.fn(async (algorithm, data) => {
      if (algorithm !== 'SHA-256') {
        throw new Error('Only SHA-256 is supported in mock');
      }
      // Simulate a SHA-256 hash for testing purposes
      const text = new TextDecoder().decode(data);
      const hash = Array.from(text)
        .map((char) => char.charCodeAt(0).toString(16))
        .join('');
      return Promise.resolve(new TextEncoder().encode(hash).buffer);
    }) as jest.MockedFunction<SubtleCrypto['digest']>,
  } as Partial<SubtleCrypto>,
  getRandomValues: jest.fn((array: Uint8Array): Uint8Array => array) as jest.MockedFunction<
    Crypto['getRandomValues']
  >,
  randomUUID: jest.fn((): string => 'mock-uuid') as jest.MockedFunction<Crypto['randomUUID']>,
} as Crypto;

const mockTransaction = jest.fn();

jest.mock('@/infrastructure/database/drizzle/drizzle', () => ({
  db: { transaction: (cb: (tx: Transaction) => Promise<void>) => mockTransaction(cb) },
}));

jest.mock('@/domain/utils/page-view.utils', () => ({
  crawlingBotCheck: jest.fn(),
}));

jest.mock('@/domain/utils/crypto.utils', () => ({
  hashIp: jest.fn(),
}));

import { PageViewRepositoryPort } from '@/application/port/page-view-repository.port';
import { SiteMetricsRepositoryPort } from '@/application/port/site-metrics-repository.port';
import { VisitorInfoRepositoryPort } from '@/application/port/visitor-info-repository.port';
import { createPageViewUseCaseAdapter } from '@/application/use-cases/page-view-usecase.adapter';
import { PageView } from '@/domain/entities/page-view.entity';
import { SiteMetric } from '@/domain/entities/site-metric.entity';
import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { hashIp } from '@/domain/utils/crypto.utils';
import { crawlingBotCheck } from '@/domain/utils/page-view.utils';
import { Transaction } from '@/infrastructure/database/drizzle/drizzle';

// Mocks for repository ports
const mockPageViewRepo: jest.Mocked<PageViewRepositoryPort> = {
  addAboutPageView: jest.fn(),
  addDetailPageView: jest.fn(),
  addMainPageView: jest.fn(),
  getAllPageViews: jest.fn(),
  getPageViewOrCreate: jest.fn(),
  updatePageView: jest.fn(),
};

const mockVisitorInfoRepo: jest.Mocked<VisitorInfoRepositoryPort> = {
  getVisitorInfoOrCreate: jest.fn(),
  createVisitorInfo: jest.fn(),
  updateVisitorPathname: jest.fn(),
};

const mockSiteMetricRepo: jest.Mocked<SiteMetricsRepositoryPort> = {
  updateSiteMetric: jest.fn(),
};

describe('addMainPageView use case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (crawlingBotCheck as jest.Mock).mockClear();
    (hashIp as jest.Mock).mockClear(); // Clear the mock for hashIp
  });

  it('should return early for crawling bots', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(true);

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(
      new Headers({
        'user-agent': 'Googlebot',
        'x-forwarded-for': '1.2.3.4',
      })
    );

    await adapter.addMainPageView(headersPromise);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(crawlingBotCheck).toHaveBeenCalledWith('Googlebot');
    expect(hashIp).not.toHaveBeenCalled(); // 👈 추가
  });

  it('should run transaction and call repos on normal request', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash'); // 👈 추가

    // Make db.transaction execute the callback
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    // Mock repo behaviors
    const mockVisitorInfo: VisitorInfo = {
      id: 'some-id',
      ipHash: 'mock-ip-hash',
      userAgent: 'Mozilla/5.0',
      date: '2023-01-01',
      visitedPathnames: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: true,
      data: mockVisitorInfo,
    });
    mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
      success: true,
      data: mockVisitorInfo,
    });

    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: 'main',
      pathname: 'main',
      viewCount: 1,
      likeCount: 0,
      date: '2023-01-01',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: true,
      data: mockPageView,
    });
    mockPageViewRepo.updatePageView.mockResolvedValue({
      success: true,
      data: mockPageView,
    });

    const mockSiteMetric: SiteMetric = {
      id: 'site-metric-id',
      date: '2023-01-01',
      totalVisits: 1,
      dailyVisits: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockSiteMetricRepo.updateSiteMetric.mockResolvedValue({
      success: true,
      data: mockSiteMetric,
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(
      new Headers({
        'user-agent': 'Mozilla/5.0',
        'x-forwarded-for': '1.2.3.4',
      })
    );

    await adapter.addMainPageView(headersPromise);

    expect(crawlingBotCheck).toHaveBeenCalledWith('Mozilla/5.0');
    expect(hashIp).toHaveBeenCalledWith('1.2.3.4'); // 👈 추가
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledWith(
      {
        ipHash: 'mock-ip-hash',
        todayKST: expect.any(String),
        pathName: 'main',
        userAgent: 'Mozilla/5.0',
      },
      expect.any(Object)
    ); // 👈 수정
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalled();
  });
});
