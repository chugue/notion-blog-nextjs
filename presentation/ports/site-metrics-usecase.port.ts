import { MainPageChartData } from '@/shared/types/main-page-chartdata';

export interface SiteMetricsUsecasePort {
  readonly getThirtyDaysSiteMetrics: () => Promise<MainPageChartData[]>;
}
