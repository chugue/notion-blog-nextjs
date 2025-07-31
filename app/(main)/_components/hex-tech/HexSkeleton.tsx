'use client';

import React, { useRef } from 'react';
import { cn } from '@/shared/utils/tailwind-cn';
import { useRefCenter } from '../../../../presentation/hooks/main/use-ref-center';
import { useHoneycombInit } from '../../../../presentation/hooks/main/use-honeycomb-init';
import { useHoneycombMemo } from '../../../../presentation/hooks/main/use-honeycomb-memo';

interface HexSkeletonItemProps {
  delay?: number;
}

const HexSkeletonItem: React.FC<HexSkeletonItemProps> = ({ delay = 0 }) => {
  return (
    <div
      className="relative h-24 w-24"
      style={{
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        animationDelay: `${delay}ms`,
      }}
      role="status"
      aria-label="기술 스택 로딩 중"
    >
      {/* 기본 배경 */}
      <div className="animate-pulse-subtle absolute inset-0 bg-gray-200 dark:bg-gray-700" />

      {/* Shimmer 효과 */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent',
          'animate-shimmer dark:via-gray-400/40'
        )}
        style={{
          animationDelay: `${delay}ms`,
        }}
      />

      {/* 내부 아이콘 영역 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="animate-pulse-subtle h-8 w-8 rounded-sm bg-gray-300 dark:bg-gray-600"
          style={{
            animationDelay: `${delay + 200}ms`,
          }}
        />
      </div>
    </div>
  );
};

export const HexSkeleton: React.FC = () => {
  const resizeRef = useRef<HTMLDivElement>(null);

  // FlipHexTechStack과 동일한 더미 데이터 생성 (20개)
  const mockTechStacks = Array.from({ length: 20 }, (_, index) => ({
    id: `skeleton-${index}`,
    name: `Tech ${index}`,
    icon: '',
    color: '#666666',
    description: '',
    tagName: '',
  }));

  // FlipHexTechStack과 동일한 훅 사용 👈
  const { positions } = useHoneycombMemo(mockTechStacks);
  const centerX = useRefCenter(resizeRef, 770);
  const isInitialized = useHoneycombInit(centerX, resizeRef);

  return (
    <div className={cn('relative ml-10 max-lg:hidden')}>
      {/* 그라데이션 오버레이 (FlipHexTechStack과 동일) */}
      <div className="from-background via-background/80 pointer-events-none absolute top-0 left-0 z-30 h-full w-10 bg-gradient-to-r to-transparent" />
      <div className="from-background via-background/80 pointer-events-none absolute top-0 right-0 z-30 h-full w-10 bg-gradient-to-l to-transparent" />

      <div className="flex h-[280px] w-full flex-col justify-center">
        {/* 허니콤 패턴 컨테이너 */}
        <div ref={resizeRef} className="flex h-full overflow-x-auto pt-3">
          <div className="relative flex" style={{ opacity: isInitialized ? 1 : 0 }}>
            {mockTechStacks.map((_, index) => {
              const position = positions[index];
              // 1,3열은 z-10, 2,4열은 z-20 (HexCard와 동일한 로직)
              const zIndex = position.row % 2 === 0 ? 10 : 20;

              return (
                <div
                  key={`skeleton-${index}`}
                  className="absolute"
                  style={{
                    left: `${position.x + centerX}px`,
                    top: `${position.y}px`,
                    zIndex: zIndex,
                  }}
                >
                  <HexSkeletonItem delay={index * 100} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
