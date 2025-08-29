import { jest } from '@jest/globals';
import { SiteMetricsRepositoryPort } from '../../../application/port/site-metrics-repository.port';
import createSiteMetricUsecaseAdapter from '../../../application/use-cases/site-metric-usecase.adapter';
import { SiteMetric } from '../../../domain/entities/site-metric.entity';

// dateToKoreaDateString 함수를 모킹합니다.
const mockDateToKoreaDateString = jest.fn((date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

jest.mock('../../../shared/utils/format-date', () => ({
  dateToKoreaDateString: mockDateToKoreaDateString,
}));

describe('SiteMetricUsecaseAdapter', () => {
  let mockSiteMetricRepository: SiteMetricsRepositoryPort;

  beforeEach(() => {
    mockSiteMetricRepository = {
      getSiteMetricsByDateRange: jest.fn(),
      updateSiteMetric: jest.fn(),
    };
  });

  describe('getThirtyDaysSiteMetrics', () => {
    it('성공적으로 30일간의 사이트 지표를 가져와 날짜 순으로 정렬하여 반환해야 한다', async () => {
      // Given
      const mockMetrics: SiteMetric[] = [
        {
          id: '1',
          date: '2023-11-29',
          totalVisits: 10,
          dailyVisits: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          date: '2023-11-30',
          totalVisits: 12,
          dailyVisits: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          date: '2023-11-28',
          totalVisits: 8,
          dailyVisits: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockSiteMetricRepository.getSiteMetricsByDateRange as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMetrics,
      });

      const siteMetricUsecase = createSiteMetricUsecaseAdapter(mockSiteMetricRepository);

      // When
      const result = await siteMetricUsecase.getThirtyDaysSiteMetrics();

      // Then
      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledTimes(1);
      // 날짜 계산을 기반으로 정확한 start/endDate를 검증하기 위해 실제 호출 값을 확인합니다.
      const today = new Date();
      const todayKST = mockDateToKoreaDateString(today);
      const thirtyDaysAgoDate = new Date();
      thirtyDaysAgoDate.setDate(today.getDate() - 29);
      const thirtyDaysAgoKST = mockDateToKoreaDateString(thirtyDaysAgoDate);

      expect(mockDateToKoreaDateString).toHaveBeenCalledWith(today);
      expect(mockDateToKoreaDateString).toHaveBeenCalledWith(thirtyDaysAgoDate);

      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledWith(
        thirtyDaysAgoKST,
        todayKST
      );

      expect(result).toEqual([
        {
          id: '3',
          date: '2023-11-28',
          totalVisits: 8,
          dailyVisits: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: '1',
          date: '2023-11-29',
          totalVisits: 10,
          dailyVisits: 2,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: '2',
          date: '2023-11-30',
          totalVisits: 12,
          dailyVisits: 3,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    it('getSiteMetricsByDateRange 호출이 실패하면 빈 배열을 반환해야 한다', async () => {
      // Given
      const errorMessage = '데이터를 가져오는 중 오류 발생';
      (mockSiteMetricRepository.getSiteMetricsByDateRange as jest.Mock).mockResolvedValue({
        success: false,
        error: new Error(errorMessage),
      });

      const siteMetricUsecase = createSiteMetricUsecaseAdapter(mockSiteMetricRepository);

      // When
      const result = await siteMetricUsecase.getThirtyDaysSiteMetrics();

      // Then
      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('metric이 null인 경우 기본값으로 채워진 객체를 반환해야 한다', async () => {
      // Given
      const mockMetricsWithNull: (SiteMetric | null)[] = [
        {
          id: '1',
          date: '2023-11-29',
          totalVisits: 10,
          dailyVisits: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        null, // null 값 포함
        {
          id: '3',
          date: '2023-11-28',
          totalVisits: 8,
          dailyVisits: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockSiteMetricRepository.getSiteMetricsByDateRange as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMetricsWithNull,
      });

      const siteMetricUsecase = createSiteMetricUsecaseAdapter(mockSiteMetricRepository);

      // When
      const result = await siteMetricUsecase.getThirtyDaysSiteMetrics();

      // Then
      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          id: '1',
          date: '2023-11-29',
          totalVisits: 10,
          dailyVisits: 2,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: '',
          date: 'N/A',
          totalVisits: 0,
          dailyVisits: 0,
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          id: '3',
          date: '2023-11-28',
          totalVisits: 8,
          dailyVisits: 1,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });
});
