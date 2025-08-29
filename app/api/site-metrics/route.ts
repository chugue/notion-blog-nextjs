import { diContainer } from '@/shared/di/di-container';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { Result } from '@/shared/types/result';
import { NextResponse } from 'next/server';

export async function GET(req: Request): Promise<NextResponse<Result<MainPageChartData[]>>> {
  try {
    const siteMetricUseCase = diContainer.siteMetric.siteMetricUsecase;
    const data = await siteMetricUseCase.getThirtyDaysSiteMetrics();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: new Error('Failed to fetch site metrics'),
    });
  }
}
