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
      pathname: '/', // 👈 수정
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
        pathname: '/', // 👈 수정
        userAgent: 'Mozilla/5.0',
      },
      expect.any(Object)
    ); // 👈 수정
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalledWith(
      mockVisitorInfo,
      '/',
      expect.any(String),
      expect.any(Object)
    );
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalledWith(
      expect.any(String),
      'main',
      '/',
      expect.any(Object)
    );
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalledWith(mockPageView, expect.any(Object));
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
  });

  it('should return early if getVisitorInfoOrCreate fails with status code 400', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      statusCode: 400,
      error: new Error('Bad request'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await adapter.addMainPageView(headersPromise);

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if getVisitorInfoOrCreate fails without status code 400', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Some other error'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addMainPageView(headersPromise)).rejects.toThrow('Some other error');

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if updateVisitorPathname fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

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
      success: false,
      error: new Error('Failed to update visitor pathname'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addMainPageView(headersPromise)).rejects.toThrow(
      'Failed to update visitor pathname'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if getPageViewOrCreate fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

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
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Failed to get or create page view'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addMainPageView(headersPromise)).rejects.toThrow(
      'Failed to get or create page view'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if updatePageView fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

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
      pathname: '/',
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
      success: false,
      error: new Error('Failed to update page view'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addMainPageView(headersPromise)).rejects.toThrow(
      'Failed to update page view'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if updateSiteMetric fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

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
      pathname: '/',
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
    mockSiteMetricRepo.updateSiteMetric.mockResolvedValue({
      success: false,
      error: new Error('Failed to update site metric'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addMainPageView(headersPromise)).rejects.toThrow(
      'Failed to update site metric'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalled();
  });
});

describe('addDetailPageView use case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (crawlingBotCheck as jest.Mock).mockClear();
    (hashIp as jest.Mock).mockClear();
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
    const pageId = 'test-page-id';

    await adapter.addDetailPageView(headersPromise, pageId);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(crawlingBotCheck).toHaveBeenCalledWith('Googlebot');
    expect(hashIp).not.toHaveBeenCalled();
  });

  it('should run transaction and call repos on normal request', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'test-page-id';
    const pathname = `blog/${pageId}`;
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
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
      date: todayKST,
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

    await adapter.addDetailPageView(headersPromise, pageId);

    expect(crawlingBotCheck).toHaveBeenCalledWith('Mozilla/5.0');
    expect(hashIp).toHaveBeenCalledWith('1.2.3.4');
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledWith(
      {
        ipHash: 'mock-ip-hash',
        todayKST: expect.any(String),
        pathname: pathname,
        userAgent: 'Mozilla/5.0',
      },
      expect.any(Object)
    );
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalledWith(
      expect.any(String),
      pageId,
      pathname,
      expect.any(Object)
    );
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalledWith(mockPageView, expect.any(Object));
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalledWith(
      mockVisitorInfo,
      pathname,
      expect.any(String),
      expect.any(Object)
    );
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
  });

  it('should return early if visitorInfoRepo.getVisitorInfoOrCreate fails with status code 400', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      statusCode: 400,
      error: new Error('Bad request'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    const pageId = 'test-page-id';
    await adapter.addDetailPageView(headersPromise, pageId);

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if visitorInfoRepo.getVisitorInfoOrCreate fails without status code 400', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Some other error'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    const pageId = 'test-page-id';
    await expect(adapter.addDetailPageView(headersPromise, pageId)).rejects.toThrow(
      'Some other error'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if pageViewRepo.getPageViewOrCreate fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'test-page-id';
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
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Failed to get or create page view'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addDetailPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to get or create page view'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if pageViewRepo.updatePageView fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'test-page-id';
    const pathname = `blog/${pageId}`;
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: true,
      data: mockPageView,
    });
    mockPageViewRepo.updatePageView.mockResolvedValue({
      success: false,
      error: new Error('Failed to update page view'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addDetailPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to update page view'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if visitorInfoRepo.updateVisitorPathname fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'test-page-id';
    const pathname = `blog/${pageId}`;
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
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
    mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
      success: false,
      error: new Error('Failed to update visitor pathname'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addDetailPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to update visitor pathname'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if siteMetricRepo.updateSiteMetric fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'test-page-id';
    const pathname = `blog/${pageId}`;
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
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
    mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
      success: true,
      data: mockVisitorInfo,
    });
    mockSiteMetricRepo.updateSiteMetric.mockResolvedValue({
      success: false,
      error: new Error('Failed to update site metric'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addDetailPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to update site metric'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalled();
  });
});

describe('addAboutPageView use case', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (crawlingBotCheck as jest.Mock).mockClear();
    (hashIp as jest.Mock).mockClear();
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
    const pageId = 'about';

    await adapter.addAboutPageView(headersPromise, pageId);

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(crawlingBotCheck).toHaveBeenCalledWith('Googlebot');
    expect(hashIp).not.toHaveBeenCalled();
  });

  it('should run transaction and call repos on normal request', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'about';
    const pathname = '/about';
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
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
      date: todayKST,
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

    await adapter.addAboutPageView(headersPromise, pageId);

    expect(crawlingBotCheck).toHaveBeenCalledWith('Mozilla/5.0');
    expect(hashIp).toHaveBeenCalledWith('1.2.3.4');
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalledWith(
      {
        ipHash: 'mock-ip-hash',
        todayKST: expect.any(String),
        pathname: pathname,
        userAgent: 'Mozilla/5.0',
      },
      expect.any(Object)
    );
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalledWith(
      expect.any(String),
      pageId,
      pathname,
      expect.any(Object)
    );
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalledWith(mockPageView, expect.any(Object));
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalledWith(
      mockVisitorInfo,
      pathname,
      expect.any(String),
      expect.any(Object)
    );
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
  });

  it('should return early if visitorInfoRepo.getVisitorInfoOrCreate fails with status code 400', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      statusCode: 400,
      error: new Error('Bad request'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    const pageId = 'about';
    await adapter.addAboutPageView(headersPromise, pageId);

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if visitorInfoRepo.getVisitorInfoOrCreate fails without status code 400', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    mockVisitorInfoRepo.getVisitorInfoOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Some other error'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    const pageId = 'about';
    await expect(adapter.addAboutPageView(headersPromise, pageId)).rejects.toThrow(
      'Some other error'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).not.toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if pageViewRepo.getPageViewOrCreate fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'about';
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
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: false,
      error: new Error('Failed to get or create page view'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addAboutPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to get or create page view'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).not.toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if pageViewRepo.updatePageView fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'about';
    const pathname = '/about';
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPageViewRepo.getPageViewOrCreate.mockResolvedValue({
      success: true,
      data: mockPageView,
    });
    mockPageViewRepo.updatePageView.mockResolvedValue({
      success: false,
      error: new Error('Failed to update page view'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addAboutPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to update page view'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).not.toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if visitorInfoRepo.updateVisitorPathname fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'about';
    const pathname = '/about';
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
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
    mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
      success: false,
      error: new Error('Failed to update visitor pathname'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addAboutPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to update visitor pathname'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).not.toHaveBeenCalled();
  });

  it('should throw error if siteMetricRepo.updateSiteMetric fails', async () => {
    (crawlingBotCheck as jest.Mock).mockReturnValue(false);
    (hashIp as jest.Mock).mockResolvedValue('mock-ip-hash');
    mockTransaction.mockImplementation(async (cb: (tx: Transaction) => Promise<void>) =>
      cb({} as Transaction)
    );

    const pageId = 'about';
    const pathname = '/about';
    const todayKST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
      new Date()
    );

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
    const mockPageView: PageView = {
      id: 'page-view-id',
      notionPageId: pageId,
      pathname: pathname,
      viewCount: 1,
      likeCount: 0,
      date: todayKST,
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
    mockVisitorInfoRepo.updateVisitorPathname.mockResolvedValue({
      success: true,
      data: mockVisitorInfo,
    });
    mockSiteMetricRepo.updateSiteMetric.mockResolvedValue({
      success: false,
      error: new Error('Failed to update site metric'),
    });

    const adapter = createPageViewUseCaseAdapter(
      mockPageViewRepo,
      mockVisitorInfoRepo,
      mockSiteMetricRepo
    );

    const headersPromise = Promise.resolve(new Headers());
    await expect(adapter.addAboutPageView(headersPromise, pageId)).rejects.toThrow(
      'Failed to update site metric'
    );

    expect(mockVisitorInfoRepo.getVisitorInfoOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.getPageViewOrCreate).toHaveBeenCalled();
    expect(mockPageViewRepo.updatePageView).toHaveBeenCalled();
    expect(mockVisitorInfoRepo.updateVisitorPathname).toHaveBeenCalled();
    expect(mockSiteMetricRepo.updateSiteMetric).toHaveBeenCalled();
  });
});
