'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { MainPageChartData } from '@/shared/types/main-page-chartdata';
import { cn } from '@/shared/utils/tailwind-cn';
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

export function VisitStats({ className }: { className?: string }) {
  const { data: siteMetrics, isFetching } = useQuery({
    queryKey: ['site-metrics-client'],
    queryFn: async () => {
      const res = await fetch('/api/site-metrics').then((res) => res.json());
      if (!res.success) return [];

      console.log('👉👉👉👉👉👉res.data ', res.data);

      return res.data as MainPageChartData[];
    },
    staleTime: 0, // 5분
  });

  const total = React.useMemo(
    () => ({
      daily: siteMetrics?.[siteMetrics.length - 1]?.daily,
      total: siteMetrics?.[siteMetrics.length - 1]?.total,
    }),
    [siteMetrics]
  );

  return (
    <Card className={cn('items-center justify-center p-0', className)}>
      <CardContent className="flex w-full flex-col gap-0">
        {isFetching ? (
          <div className="flex h-[250px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <CardHeader className="flex w-full flex-col items-center justify-center">
              <div className="flex h-[100px] w-full flex-row items-center gap-10">
                <div className="order-1 flex flex-1 flex-col items-center justify-between gap-4">
                  <span className="text-muted-foreground text-md whitespace-nowrap">
                    {chartConfig.daily.label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {total.daily?.toLocaleString()}
                  </span>
                </div>
                <span className="order-2 h-[80%] items-center border-l-1 border-gray-600" />

                <div className="order-3 flex flex-1 flex-col items-center justify-center gap-4">
                  <span className="text-muted-foreground text-md whitespace-nowrap">
                    {chartConfig.total.label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {total.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            <ChartContainer config={chartConfig} className="aspect-auto h-[150px] w-full">
              <AreaChart
                accessibilityLayer
                data={siteMetrics}
                margin={{
                  left: 10,
                  right: 10,
                }}
              >
                <defs>
                  <linearGradient id="fillDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  padding={{ left: 0, right: 0 }}
                  minTickGap={32}
                  width={100}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <YAxis
                  dataKey="daily"
                  width={0}
                  tickMargin={8}
                  // dataMax이 차트 높이의 70% 위치에 오도록 상단을 dataMax / 0.7으로 설정
                  domain={[
                    0,
                    (dataMax: number) =>
                      // 소수점 3자리로 반올림해 정밀도 유지
                      Number((dataMax / 0.7).toFixed(3)),
                  ]}
                  tickFormatter={(v) => v.toLocaleString()}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-fit"
                      nameKey="views"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      }}
                    />
                  }
                />
                <Area
                  dataKey="daily"
                  type="monotone"
                  fill="url(#fillDaily)"
                  fillOpacity={0.4}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  // @ts-expect-error dot 타입 정의 추가 필요
                  dot={(props) => {
                    const { index } = props;
                    const isLastPoint = index === (siteMetrics?.length || 0) - 1;

                    if (!isLastPoint) return null;

                    return (
                      <g key={index}>
                        {/* 첫 번째 레이더 원 */}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={3}
                          fill="var(--color-primary)"
                          opacity={0.6}
                        >
                          <animate
                            attributeName="r"
                            values="3;15"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.6;0"
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* 두 번째 레이더 원 (시차) */}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={3}
                          fill="var(--color-primary)"
                          opacity={0.6}
                        >
                          <animate
                            attributeName="r"
                            values="3;15"
                            dur="3s"
                            begin="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.6;0"
                            dur="3s"
                            begin="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* 메인 점 */}
                        <circle cx={props.cx} cy={props.cy} r={5} fill="var(--color-primary)" />
                      </g>
                    );
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
