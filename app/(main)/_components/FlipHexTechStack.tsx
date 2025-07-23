'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { cn } from '@/lib/utils/tailwind-cn';

// GSAP 플러그인 등록
gsap.registerPlugin(Flip);

interface TechStackItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tagName: string;
  category: 'frontend' | 'backend' | 'mobile' | 'database' | 'devops';
}

const techStacks: TechStackItem[] = [
  {
    id: '1',
    name: 'React',
    icon: '/icons/react.svg',
    color: '#61DAFB',
    description: 'UI 라이브러리',
    tagName: 'React',
    category: 'frontend',
  },
  {
    id: '2',
    name: 'Next.js',
    icon: '/icons/nextjs.svg',
    color: '#000000',
    description: 'React 프레임워크',
    tagName: 'Next.js',
    category: 'frontend',
  },
  {
    id: '3',
    name: 'Vue.js',
    icon: '/icons/vue.svg',
    color: '#4FC08D',
    description: '프로그레시브 프레임워크',
    tagName: 'Vue.js',
    category: 'frontend',
  },
  {
    id: '4',
    name: 'TypeScript',
    icon: '/icons/typescript.svg',
    color: '#3178C6',
    description: '타입 안전한 JavaScript',
    tagName: 'TypeScript',
    category: 'frontend',
  },
  {
    id: '5',
    name: 'Node.js',
    icon: '/icons/nodejs.svg',
    color: '#339933',
    description: 'JavaScript 런타임',
    tagName: 'Node.js',
    category: 'backend',
  },
  {
    id: '6',
    name: 'Java',
    icon: '/icons/java.svg',
    color: '#007396',
    description: '객체지향 언어',
    tagName: 'Java',
    category: 'backend',
  },
  {
    id: '7',
    name: 'Spring Boot',
    icon: '/icons/spring-boot.svg',
    color: '#6DB33F',
    description: 'Java 프레임워크',
    tagName: 'Spring Boot',
    category: 'backend',
  },
  {
    id: '8',
    name: 'Python',
    icon: '/icons/python.svg',
    color: '#3776AB',
    description: '다목적 언어',
    tagName: 'Python',
    category: 'backend',
  },
  {
    id: '9',
    name: 'NestJS',
    icon: '/icons/nestjs.svg',
    color: '#E0234E',
    description: 'Node.js 프레임워크',
    tagName: 'NestJS',
    category: 'backend',
  },
  {
    id: '10',
    name: 'Flutter',
    icon: '/icons/flutter.svg',
    color: '#02569B',
    description: '크로스플랫폼',
    tagName: 'Flutter',
    category: 'mobile',
  },
  {
    id: '11',
    name: 'React Native',
    icon: '/icons/react.svg',
    color: '#61DAFB',
    description: '모바일 개발',
    tagName: 'React Native',
    category: 'mobile',
  },
  {
    id: '12',
    name: 'MongoDB',
    icon: '/icons/mongodb.svg',
    color: '#47A248',
    description: 'NoSQL 데이터베이스',
    tagName: 'MongoDB',
    category: 'database',
  },
  {
    id: '13',
    name: 'PostgreSQL',
    icon: '/icons/postgresql.svg',
    color: '#336791',
    description: 'SQL 데이터베이스',
    tagName: 'PostgreSQL',
    category: 'database',
  },
  {
    id: '14',
    name: 'Redis',
    icon: '/icons/redis.svg',
    color: '#DC382D',
    description: '인메모리 DB',
    tagName: 'Redis',
    category: 'database',
  },
  {
    id: '15',
    name: 'Docker',
    icon: '/icons/docker.svg',
    color: '#2496ED',
    description: '컨테이너 플랫폼',
    tagName: 'Docker',
    category: 'devops',
  },
  {
    id: '16',
    name: 'AWS',
    icon: '/icons/aws.svg',
    color: '#FF9900',
    description: '클라우드 서비스',
    tagName: 'AWS',
    category: 'devops',
  },
  {
    id: '17',
    name: 'Kubernetes',
    icon: '/icons/kubernetes.svg',
    color: '#326CE5',
    description: '컨테이너 오케스트레이션',
    tagName: 'Kubernetes',
    category: 'devops',
  },
  {
    id: '18',
    name: 'GraphQL',
    icon: '/icons/graphql.svg',
    color: '#E10098',
    description: 'API 쿼리 언어',
    tagName: 'GraphQL',
    category: 'backend',
  },
  {
    id: '19',
    name: 'Tailwind',
    icon: '/icons/tailwind.svg',
    color: '#06B6D4',
    description: 'CSS 프레임워크',
    tagName: 'Tailwind CSS',
    category: 'frontend',
  },
  {
    id: '20',
    name: 'HTML',
    icon: '/icons/html5.svg',
    color: '#E34F26',
    description: '마크업 언어',
    tagName: 'HTML',
    category: 'frontend',
  },
];

interface HexCardProps {
  tech: TechStackItem;
  index: number;
  onHover: (id: string | null) => void;
  hoveredId: string | null;
  row: number;
}

const HexCard: React.FC<HexCardProps> = ({ tech, index, onHover, hoveredId, row }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const isHovered = hoveredId === tech.id;
  const isOtherHovered = hoveredId && hoveredId !== tech.id;

  // 1,3열은 z-10, 2,4열은 z-20
  const zIndex = row % 2 === 0 ? 10 : 20;

  useEffect(() => {
    if (!cardRef.current) return;

    // 진입 애니메이션
    gsap.fromTo(
      cardRef.current,
      {
        scale: 0,
        rotation: 360,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.05,
        ease: 'back.out(1.7)',
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
        onHover(tech.id);
        setIsFlipped(true);
      }}
      onMouseLeave={() => {
        onHover(null);
        setIsFlipped(false);
      }}
    >
      {/* 앞면 - 하얀 배경 */}
      <div
        className={cn(
          'absolute inset-0 flex transform-gpu flex-col items-center justify-center bg-white transition-all duration-500',
          isFlipped ? 'rotate-y-180 opacity-0' : 'opacity-100'
        )}
        style={{
          border: `2px solid ${tech.color}`,
          boxShadow: `0 2px 8px ${tech.color}20`,
        }}
      >
        <div className="relative mb-2 h-10 w-10">
          <Image
            src={tech.icon}
            alt={tech.name}
            fill
            className="object-contain"
            style={{ filter: `drop-shadow(0 0 4px ${tech.color}60)` }}
          />
        </div>
        <span
          className="px-1 text-center text-xs leading-tight font-bold"
          style={{ color: tech.color }}
        >
          {tech.name}
        </span>
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
        <p className="mb-2 text-center text-xs leading-tight font-medium text-white">
          {tech.description}
        </p>
        <Link href={`?tag=${encodeURIComponent(tech.tagName)}`}>
          <button
            className="hover:bg-opacity-90 rounded bg-white px-2 py-1 text-xs font-bold transition-all duration-200"
            style={{ color: tech.color }}
          >
            글보기
          </button>
        </Link>
      </div>
    </div>
  );
};

export function FlipHexTechStack({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 수학적으로 정확한 허니콤 패턴 (면끼리 정확히 닿도록)
  const getHoneycombPositions = () => {
    const positions = [];
    const radius = 48; // 육각형 반지름 (h-24 w-24의 절반)

    const horizontalSpacing = radius * Math.sqrt(3) + 6; // 83.14px + 6px 갭
    const verticalSpacing = radius * 1.5 + 4; // 72px + 4px 갭

    // 각 줄의 구조
    const rowConfigs = [
      { items: 4, offsetX: 0 }, // 1열: 4개
      { items: 5, offsetX: -horizontalSpacing / 2 }, // 2열: 5개, 오프셋
      { items: 4, offsetX: 0 }, // 3열: 4개
    ];

    for (let row = 0; row < rowConfigs.length; row++) {
      const config = rowConfigs[row];
      const baseY = row * verticalSpacing;

      for (let col = 0; col < config.items; col++) {
        positions.push({
          x: col * horizontalSpacing + config.offsetX,
          y: baseY,
          row,
          col,
        });
      }
    }

    return positions;
  };

  const positions = getHoneycombPositions();
  const displayedTechs = techStacks.slice(0, positions.length);

  // 필터 변경 시 Flip 애니메이션
  useEffect(() => {
    if (!containerRef.current) return;

    const state = Flip.getState('.hex-card');

    // DOM 업데이트 후 애니메이션 실행
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.8,
        ease: 'power2.inOut',
        stagger: 0.05,
        absolute: true,
      });
    });
  }, []);

  return (
    <div className={cn(`flex flex-col items-center justify-center overflow-x-auto ${className}`)}>
      {' '}
      {/* 👈 overflow-x-auto 추가 */}
      {/* 허니콤 패턴 컨테이너 */}
      <div
        ref={containerRef}
        className="relative gap-2"
        style={{
          width: '500px',
          height: '280px',
          minWidth: '500px', // 👈 최소 너비 보장
        }}
      >
        {displayedTechs.map((tech, index) => {
          const position = positions[index % positions.length];

          return (
            <div
              key={tech.id}
              className="hex-card absolute"
              style={{
                left: `${position.x + 100}px`, // 중앙 정렬을 위한 오프셋
                top: `${position.y + 65}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <HexCard
                tech={tech}
                index={index}
                onHover={setHoveredId}
                hoveredId={hoveredId}
                row={position.row}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
