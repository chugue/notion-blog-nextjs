'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/ui/chart';
import { cn } from '@/shared/utils/tailwind-cn';

const chartData = [
  { date: '2024-06-01', daily: 178, total: 200 },
  { date: '2024-06-02', daily: 470, total: 410 },
  { date: '2024-06-03', daily: 103, total: 160 },
  { date: '2024-06-04', daily: 439, total: 380 },
  { date: '2024-06-05', daily: 88, total: 140 },
  { date: '2024-06-06', daily: 294, total: 250 },
  { date: '2024-06-07', daily: 323, total: 370 },
  { date: '2024-06-08', daily: 385, total: 320 },
  { date: '2024-06-09', daily: 438, total: 480 },
  { date: '2024-06-10', daily: 155, total: 200 },
  { date: '2024-06-11', daily: 92, total: 150 },
  { date: '2024-06-12', daily: 492, total: 420 },
  { date: '2024-06-13', daily: 81, total: 130 },
  { date: '2024-06-14', daily: 426, total: 380 },
  { date: '2024-06-15', daily: 307, total: 350 },
  { date: '2024-06-16', daily: 371, total: 310 },
  { date: '2024-06-17', daily: 475, total: 520 },
  { date: '2024-06-18', daily: 107, total: 170 },
  { date: '2024-06-19', daily: 341, total: 290 },
  { date: '2024-06-20', daily: 408, total: 450 },
  { date: '2024-06-21', daily: 169, total: 210 },
  { date: '2024-06-22', daily: 317, total: 270 },
  { date: '2024-06-23', daily: 480, total: 530 },
  { date: '2024-06-24', daily: 132, total: 180 },
  { date: '2024-06-25', daily: 141, total: 190 },
  { date: '2024-06-26', daily: 434, total: 380 },
  { date: '2024-06-27', daily: 448, total: 490 },
  { date: '2024-06-28', daily: 149, total: 200 },
  { date: '2024-06-29', daily: 103, total: 160 },
  { date: '2024-06-30', daily: 446, total: 400 },
];

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
  const total = React.useMemo(
    () => ({
      daily: chartData.reduce((acc, curr) => acc + curr.daily, 0),
      total: chartData.reduce((acc, curr) => acc + curr.total, 0),
    }),
    []
  );

  return (
    <Card className={cn('p-0', className)}>
      <CardContent className="flex flex-col gap-0">
        <CardHeader className="flex min-w-0 flex-col items-center justify-center">
          <div className="flex h-[100px] w-full flex-row items-center gap-10">
            <div className="order-1 flex flex-1 flex-col items-center justify-between gap-4">
              <span className="text-muted-foreground text-md">{chartConfig.daily.label}</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total.daily.toLocaleString()}
              </span>
            </div>
            <span className="order-2 h-[80%] items-center border-l-1 border-gray-600" />

            <div className="order-3 flex flex-1 flex-col items-center justify-center gap-4">
              <span className="text-muted-foreground text-md">{chartConfig.total.label}</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total.total.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <ChartContainer config={chartConfig} className="aspect-auto h-[150px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
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
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
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
                const isLastPoint = index === chartData.length - 1;

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
                      <animate attributeName="r" values="3;15" dur="3s" repeatCount="indefinite" />
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
      </CardContent>
    </Card>
  );
}
