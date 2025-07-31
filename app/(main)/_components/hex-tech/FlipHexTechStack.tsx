'use client';

import React, { use, useRef, useState } from 'react';
import { cn } from '@/shared/utils/tailwind-cn';

import { TagFilterItem } from '@/domain/entities/post.entity';
import HexCard from './HexCard';
import { useRefCenter } from '../../../../presentation/hooks/main/use-ref-center';
import { useHoneycombInit } from '../../../../presentation/hooks/main/use-honeycomb-init';
import { useHoneycombMemo } from '../../../../presentation/hooks/main/use-honeycomb-memo';
import { toHexTechStackItem } from '@/domain/utils/hex-tech-stack.utils';
import { useSearchParams } from 'next/navigation';
import { useSelectedTagStore } from '@/presentation/stores/use-selected-tag.store';

export function FlipHexTechStack({ tags }: { tags: Promise<TagFilterItem[]> }) {
  const resizeRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const allTags = use(tags);

  const { selectedTag, setSelectedTag } = useSelectedTagStore();

  const techStacks = toHexTechStackItem(allTags);

  // 태그 갯수가 바뀔 시에만 업데이트 되도록 최적화 -> 허니콤 전체 가로 길이 계산
  const { positions, honeycombWidth } = useHoneycombMemo(techStacks);

  // 허니콤 길이와 부모길의를 계산해서 중앙값 계산
  const centerX = useRefCenter(resizeRef, honeycombWidth);

  // 허니콤 초기화 완료 체크
  const isInitialized = useHoneycombInit(centerX, resizeRef);

  return (
    <div className={cn(`relative ml-10 max-lg:hidden`)}>
      {/* 그라데이션 */}
      <div className="from-background via-background/80 pointer-events-none absolute top-0 left-0 z-30 h-full w-10 bg-gradient-to-r to-transparent" />
      <div className="from-background via-background/80 pointer-events-none absolute top-0 right-0 z-30 h-full w-10 bg-gradient-to-l to-transparent" />

      <div className="flex h-[280px] w-full flex-col justify-center">
        {/* 허니콤 패턴 컨테이너 */}
        <div ref={resizeRef} className="flex h-full overflow-x-auto pt-3">
          <div className="relative flex" style={{ opacity: isInitialized ? 1 : 0 }}>
            {techStacks.map((tech, index) => {
              const position = positions[index];
              return (
                <div
                  key={tech.name}
                  className="hex-card absolute"
                  style={{
                    left: `${position.x + centerX}px`,
                    top: `${position.y}px`,
                  }}
                >
                  <HexCard
                    tech={tech}
                    index={index}
                    onHover={setHoveredId}
                    hoveredId={hoveredId}
                    row={position.row}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
