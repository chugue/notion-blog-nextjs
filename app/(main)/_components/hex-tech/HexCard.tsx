'use client';

import { TechStackItem } from '@/domain/entities/hex-tech-stack';
import useCardAnimation from '@/presentation/hooks/main/use-card-animation';
import useFlipped from '@/presentation/hooks/main/use-flipped';
import useMounted from '@/presentation/hooks/main/use-mounted';
import { useSelectedTagStore } from '@/presentation/stores/use-selected-tag.store';
import { cn } from '@/shared/utils/tailwind-cn';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface HexCardProps {
  tech: TechStackItem;
  index: number;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  row: number;
}

// GSAP 플러그인 등록
gsap.registerPlugin(Flip);

const HexCard: React.FC<HexCardProps> = ({ tech, index, onHover, hoveredId, row }) => {
  const { isFlipped, setIsFlipped, activeTag } = useFlipped(tech);
  const setOptimisticTag = useSelectedTagStore((state) => state.setOptimisticTag);
  const setChanging = useSelectedTagStore((state) => state.setChanging);
  const { cardRef, zIndex } = useCardAnimation(index, hoveredId, tech, row);
  const { theme } = useTheme();
  const mounted = useMounted();
  const router = useRouter();

  const handleClick = () => {
    setIsFlipped(true);
    setOptimisticTag(tech.tagName);
    setChanging(true);
    router.push(`?tag=${encodeURIComponent(tech.tagName)}`);
  };

  return (
    <div
      ref={cardRef}
      className="relative h-24 w-24 cursor-pointer transition-all duration-300"
      style={{
        // 정육각형 clipPath
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        zIndex: zIndex,
      }}
      onMouseEnter={() => {
        onHover(tech.tagName);
        setIsFlipped(true);
      }}
      onMouseLeave={() => {
        onHover(null);
        if (activeTag !== tech.tagName) {
          setIsFlipped(false);
        }
      }}
      onClick={handleClick}
    >
      {/* 앞면 - 하얀 배경 */}
      <div
        className={cn(
          'absolute inset-0 flex transform-gpu flex-col items-center justify-center transition-all duration-500',
          isFlipped ? 'rotate-y-180 opacity-0' : 'opacity-100',
          mounted && theme === 'dark' ? 'bg-white' : 'bg-primary/10'
        )}
      >
        <div className="relative h-10 w-10">
          <Image
            src={tech.icon}
            alt={tech.tagName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="rounded-sm object-contain"
            style={{ filter: `drop-shadow(0 0 4px ${tech.color}60)` }}
          />
        </div>
      </div>

      {/* 뒷면 */}
      <div
        className={cn(
          'absolute inset-0 flex transform-gpu flex-col items-center justify-center p-2 transition-all duration-500',
          isFlipped ? 'opacity-100' : 'rotate-y-180 opacity-0'
        )}
        style={{
          backgroundColor: tech.color,
          border: `2px solid ${tech.color}`,
        }}
      >
        <Link href={`?tag=${encodeURIComponent(tech.tagName)}`}>
          <p className="cursor-pointer text-center text-sm font-bold text-white">{tech.tagName}</p>
        </Link>
      </div>
    </div>
  );
};

export default HexCard;
