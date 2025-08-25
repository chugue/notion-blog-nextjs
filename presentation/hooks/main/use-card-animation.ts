import { TechStackItem } from '@/domain/entities/hex-tech-stack';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

const useCardAnimation = (
  index: number,
  hoveredId: string | null,
  tech: TechStackItem,
  row: number
) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const isHovered = hoveredId === tech.name;
  const isOtherHovered = hoveredId && hoveredId !== tech.name;
  const zIndex = row % 2 === 0 ? 10 : 20;

  useEffect(() => {
    if (!cardRef?.current) return;

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
    if (!cardRef.current) return;

    // 호버 상태에 따른 스케일 애니메이션
    gsap.to(cardRef.current, {
      scale: isHovered ? 1.15 : isOtherHovered ? 0.95 : 1,
      zIndex: isHovered ? 50 : zIndex,
      duration: 0.3,
      ease: 'power2.out',
    });
  }, [isHovered, isOtherHovered, zIndex]);

  return { cardRef, zIndex };
};

export default useCardAnimation;
