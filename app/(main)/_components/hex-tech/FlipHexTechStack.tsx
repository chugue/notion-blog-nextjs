'use client';

import { cn } from '@/shared/utils/tailwind-cn';
import { use, useRef, useState } from 'react';

import { TagFilterItem } from '@/domain/entities/post.entity';
import { toHexTechStackItem } from '@/domain/utils/hex-tech-stack.utils';
import { useHoneycombInit } from '../../../../presentation/hooks/main/use-honeycomb-init';
import { useHoneycombMemo } from '../../../../presentation/hooks/main/use-honeycomb-memo';
import { useRefCenter } from '../../../../presentation/hooks/main/use-ref-center';
import HexCard from './HexCard';

export function FlipHexTechStack({
  tags,
  selectedTag,
}: {
  tags: Promise<TagFilterItem[]>;
  selectedTag: string;
}) {
  const resizeRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const allTags = use(tags);

  const techStacks = toHexTechStackItem(allTags);

  const { positions, honeycombWidth } = useHoneycombMemo(techStacks);
  const centerX = useRefCenter(resizeRef, honeycombWidth);
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
