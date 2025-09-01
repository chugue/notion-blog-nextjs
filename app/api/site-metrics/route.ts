import { diContainer } from '@/shared/di/di-container';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { Result } from '@/shared/types/result';
import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(req: Request): Promise<NextResponse<Result<MainPageChartData[]>>> {
  try {
    const siteMetricUseCase = diContainer.siteMetric.siteMetricUsecase;
    const cachedFn = unstable_cache(
      async () => {
        const data = await siteMetricUseCase.getThirtyDaysSiteMetrics();
        return data;
      },
      ['site-metrics'],
      { tags: ['site-metrics'], revalidate: 60 }
    );

    const data = await cachedFn();
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: new Error('Failed to fetch site metrics'),
    });
  }
}
