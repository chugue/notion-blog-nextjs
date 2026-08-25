import { GET } from '@/app/api/site-metrics/route';
import { SiteMetricsRepositoryPort } from '@/application/port/site-metrics-repository.port';
import { SiteMetricsUsecasePort } from '@/presentation/ports/site-metrics-usecase.port';
import { diContainer } from '@/shared/di/di-container';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { jest } from '@jest/globals';
import { NextResponse } from 'next/server';

const mockGetThirtyDaysSiteMetrics =
  jest.fn<SiteMetricsUsecasePort['getThirtyDaysSiteMetrics']>();

const mockSiteMetricUsecase: SiteMetricsUsecasePort = {
  getThirtyDaysSiteMetrics: mockGetThirtyDaysSiteMetrics,
};

const mockSiteMetricRepository: SiteMetricsRepositoryPort = {
  getSiteMetricsByDateRange: jest.fn<SiteMetricsRepositoryPort['getSiteMetricsByDateRange']>(),
  updateSiteMetric: jest.fn<SiteMetricsRepositoryPort['updateSiteMetric']>(),
};

describe('GET /api/site-metrics', () => {
  const mockRequest = new Request('http://localhost:3000/api/site-metrics');

  beforeAll(() => {
    diContainer.siteMetric = {
      siteMetricUsecase: mockSiteMetricUsecase,
      siteMetricRepository: mockSiteMetricRepository,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetThirtyDaysSiteMetrics.mockReset(); // Clear mock before each test
  });

  it('should return site metrics successfully', async () => {
    const mockData: MainPageChartData[] = [{ id: '1', date: '2023-01-01', daily: 10, total: 100 }];
    mockGetThirtyDaysSiteMetrics.mockResolvedValue(mockData);

    const response = await GET(mockRequest);
    const result = await response.json();

    expect(mockGetThirtyDaysSiteMetrics).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true, data: mockData });
    expect(result).toEqual({ success: true, data: mockData });
    expect(response.status).toBe(200);
  });

  it('should handle errors when fetching site metrics', async () => {
    const errorMessage = 'Failed to fetch site metrics';
    mockGetThirtyDaysSiteMetrics.mockRejectedValue(new Error('DB unavailable'));

    const response = await GET(mockRequest);
    const result = await response.json();

    expect(mockGetThirtyDaysSiteMetrics).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: false,
      error: new Error(errorMessage),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe(errorMessage);
    }
  });
});
