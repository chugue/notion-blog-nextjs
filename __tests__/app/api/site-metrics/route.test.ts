import { GET } from '@/app/api/site-metrics/route';
import { diContainer } from '@/shared/di/di-container';
import { jest } from '@jest/globals';
import { NextResponse } from 'next/server';

let mockGetThirtyDaysSiteMetrics: jest.Mock;

describe('GET /api/site-metrics', () => {
  const mockRequest = {} as Request;

  beforeAll(() => {
    mockGetThirtyDaysSiteMetrics = jest.fn(); // Initialize jest.fn() inside beforeAll
    // mock implementation for siteMetricUsecase
    diContainer.siteMetric = {
      siteMetricUsecase: {
        getThirtyDaysSiteMetrics: mockGetThirtyDaysSiteMetrics,
      },
    } as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetThirtyDaysSiteMetrics.mockReset(); // Clear mock before each test
  });

  it('should return site metrics successfully', async () => {
    const mockData = [{ id: '1', date: '2023-01-01', count: 10 }];
    mockGetThirtyDaysSiteMetrics.mockResolvedValue(mockData);

    (NextResponse.json as jest.Mock).mockReturnValue({
      status: 200,
      json: async () => ({ success: true, data: mockData }),
    });

    const response = await GET(mockRequest);
    const result = await response.json();

    expect(mockGetThirtyDaysSiteMetrics).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true, data: mockData });
    expect(result).toEqual({ success: true, data: mockData });
    expect(response.status).toBe(200);
  });

  it('should handle errors when fetching site metrics', async () => {
    const errorMessage = 'Failed to fetch site metrics';
    mockGetThirtyDaysSiteMetrics.mockRejectedValue(new Error(errorMessage));

    (NextResponse.json as jest.Mock).mockReturnValue({
      status: 500,
      json: async () => ({ success: false, error: new Error(errorMessage) }),
    });

    const response = await GET(mockRequest);
    const result = await response.json();

    expect(mockGetThirtyDaysSiteMetrics).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: false,
      error: new Error(errorMessage),
    });
    expect(result.success).toBe(false);
    expect(result.error.message).toBe(errorMessage);
    expect(response.status).toBe(500);
  });
});
