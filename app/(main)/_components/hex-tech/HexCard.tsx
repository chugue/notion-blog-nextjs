'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/shared/utils/tailwind-cn';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { TechStackItem } from '@/domain/entities/hex-tech-stack';
import { useRouter } from 'next/navigation';

interface HexCardProps {
  tech: TechStackItem;
  index: number;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  row: number;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}
// GSAP 플러그인 등록
gsap.registerPlugin(Flip);

const HexCard: React.FC<HexCardProps> = ({
  tech,
  index,
  onHover,
  hoveredId,
  row,
  selectedTag,
  setSelectedTag,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const isHovered = hoveredId === tech.tagName;
  const isOtherHovered = hoveredId && hoveredId !== tech.tagName;

  // 1,3열은 z-10, 2,4열은 z-20
  const zIndex = row % 2 === 0 ? 10 : 20;

  useEffect(() => {
    if (!cardRef.current) return;

    // 진입 애니메이션
    gsap.fromTo(
      cardRef.current,
      {
        scale: 0,
        opacity: 0,
      },
      {
        scale: 1,
        opacity: 1,
        duration: 0.8,
      }
    );
  }, [index]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedTag === tech.name) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [selectedTag, tech.name]);

  useEffect(() => {
    if (!cardRef.current) return;

    // 호버 상태에 따른 스케일 애니메이션
    gsap.to(cardRef.current, {
      scale: isHovered ? 1.15 : isOtherHovered ? 0.95 : 1,
      zIndex: isHovered ? 50 : zIndex,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [isHovered, isOtherHovered, zIndex]);

  const handleClick = () => {
    setIsFlipped(true);
    setSelectedTag(tech.name);
    router.push(`?tag=${encodeURIComponent(tech.name)}`);
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
        if (selectedTag !== tech.name) {
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
            alt={tech.name}
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
