import { jest } from '@jest/globals';
import { SiteMetricsRepositoryPort } from '../../../application/port/site-metrics-repository.port';
import createSiteMetricUsecaseAdapter from '../../../application/use-cases/site-metric-usecase.adapter';
import { SiteMetric } from '../../../domain/entities/site-metric.entity';
import { dateToStringYYYYMMDD, getKstDate } from '../../../shared/utils/format-date';

// 어댑터와 동일한 방식으로 기대 날짜 목록(29일 전 -> 오늘, KST)을 계산합니다.
const getExpectedDateStrings = (): string[] => {
  const today = getKstDate();

  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - i));
    return dateToStringYYYYMMDD(date);
  });
};

const createMetric = (date: string, dailyVisits: number, totalVisits: number): SiteMetric => ({
  id: `metric-${date}`,
  date,
  dailyVisits,
  totalVisits,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('SiteMetricUsecaseAdapter', () => {
  let mockSiteMetricRepository: jest.Mocked<SiteMetricsRepositoryPort>;

  beforeEach(() => {
    mockSiteMetricRepository = {
      getSiteMetricsByDateRange: jest.fn<SiteMetricsRepositoryPort['getSiteMetricsByDateRange']>(),
      updateSiteMetric: jest.fn<SiteMetricsRepositoryPort['updateSiteMetric']>(),
    };
  });

  describe('getThirtyDaysSiteMetrics', () => {
    it('30일 범위로 조회하고, 조회된 날짜는 실제 값·없는 날짜는 0으로 채운 30개 항목을 반환해야 한다', async () => {
      // Given
      const dateStrings = getExpectedDateStrings();
      const [startDate, endDate] = [dateStrings[0], dateStrings[29]];
      const fetchedMetrics: SiteMetric[] = [
        createMetric(dateStrings[29], 3, 12),
        createMetric(dateStrings[27], 1, 8),
        createMetric(dateStrings[28], 2, 10),
      ];
      mockSiteMetricRepository.getSiteMetricsByDateRange.mockResolvedValue({
        success: true,
        data: fetchedMetrics,
      });

      const siteMetricUsecase = createSiteMetricUsecaseAdapter(mockSiteMetricRepository);

      // When
      const result = await siteMetricUsecase.getThirtyDaysSiteMetrics();

      // Then
      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledTimes(1);
      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate
      );

      expect(result).toHaveLength(30);
      expect(result.map((item) => item.date)).toEqual(dateStrings);

      expect(result[27]).toEqual({
        id: `metric-${dateStrings[27]}`,
        date: dateStrings[27],
        daily: 1,
        total: 8,
      });
      expect(result[28]).toEqual({
        id: `metric-${dateStrings[28]}`,
        date: dateStrings[28],
        daily: 2,
        total: 10,
      });
      expect(result[29]).toEqual({
        id: `metric-${dateStrings[29]}`,
        date: dateStrings[29],
        daily: 3,
        total: 12,
      });

      const emptyItems = result.slice(0, 27);
      expect(emptyItems.every((item) => item.daily === 0 && item.total === 0)).toBe(true);
      expect(emptyItems.every((item) => typeof item.id === 'string' && item.id.length > 0)).toBe(
        true
      );
    });

    it('getSiteMetricsByDateRange 호출이 실패하면 모두 0으로 채운 30개 항목을 반환해야 한다', async () => {
      // Given
      const dateStrings = getExpectedDateStrings();
      mockSiteMetricRepository.getSiteMetricsByDateRange.mockResolvedValue({
        success: false,
        error: new Error('데이터를 가져오는 중 오류 발생'),
      });

      const siteMetricUsecase = createSiteMetricUsecaseAdapter(mockSiteMetricRepository);

      // When
      const result = await siteMetricUsecase.getThirtyDaysSiteMetrics();

      // Then
      expect(mockSiteMetricRepository.getSiteMetricsByDateRange).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(30);
      expect(result.map((item) => item.date)).toEqual(dateStrings);
      expect(result.every((item) => item.daily === 0 && item.total === 0)).toBe(true);
    });

    it('date가 비어 있는 metric은 무시하고 해당 날짜를 0으로 채워야 한다', async () => {
      // Given
      const dateStrings = getExpectedDateStrings();
      mockSiteMetricRepository.getSiteMetricsByDateRange.mockResolvedValue({
        success: true,
        data: [createMetric('', 5, 50), createMetric(dateStrings[29], 3, 12)],
      });

      const siteMetricUsecase = createSiteMetricUsecaseAdapter(mockSiteMetricRepository);

      // When
      const result = await siteMetricUsecase.getThirtyDaysSiteMetrics();

      // Then
      expect(result).toHaveLength(30);
      expect(result[29]).toEqual({
        id: `metric-${dateStrings[29]}`,
        date: dateStrings[29],
        daily: 3,
        total: 12,
      });
      expect(result.slice(0, 29).every((item) => item.daily === 0 && item.total === 0)).toBe(true);
    });
  });
});
