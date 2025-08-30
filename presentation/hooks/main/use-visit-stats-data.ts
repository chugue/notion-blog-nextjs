import { ChartConfig } from '@/shared/components/ui/chart';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const chartConfig = {
  daily: {
    label: '금일 방문자수',
    color: 'var(--chart-1)',
  },
  total: {
    label: '누적 방문자수',
    color: 'var(--chart-2)',
  },
} as ChartConfig;

const useVisiStatsData = () => {
  const { data: siteMetrics, isFetching } = useQuery({
    queryKey: ['site-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/site-metrics').then((res) => res.json());
      if (!res.success) return [];

      return res.data as MainPageChartData[];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  const total = React.useMemo(
    () => ({
      daily: siteMetrics?.[siteMetrics.length - 1]?.daily,
      total: siteMetrics?.[siteMetrics.length - 1]?.total,
    }),
    [siteMetrics]
  );
  return { siteMetrics, isFetching, total, chartConfig };
};

export default useVisiStatsData;
