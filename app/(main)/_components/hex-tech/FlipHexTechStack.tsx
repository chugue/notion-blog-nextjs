'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Flip } from 'gsap/Flip';
import { cn } from '@/lib/utils/tailwind-cn';

import { TechStackItem } from '@/lib/types/blog';
import HexCard from './HexCard';
import { getHoneycombPositions } from '@/lib/utils/getHonecombPositions';
import { useRefCenter } from '../../_hooks/useRefCenter';

// 👈 컴포넌트 외부로 이동 (매번 새로 생성 방지)
const techStacks: TechStackItem[] = [
  {
    id: '1',
    name: 'React',
    icon: '/icons/react.svg',
    color: '#61DAFB',
    description: 'UI 라이브러리',
    tagName: 'React',
  },
  {
    id: '2',
    name: 'Next.js',
    icon: '/icons/nextjs.svg',
    color: '#000000',
    description: 'React 프레임워크',
    tagName: 'Next.js',
  },
  {
    id: '3',
    name: 'Vue.js',
    icon: '/icons/vue.svg',
    color: '#4FC08D',
    description: '프로그레시브 프레임워크',
    tagName: 'Vue.js',
  },
  {
    id: '4',
    name: 'TypeScript',
    icon: '/icons/typescript.svg',
    color: '#3178C6',
    description: '타입 안전한 JavaScript',
    tagName: 'TypeScript',
  },
  {
    id: '5',
    name: 'Node.js',
    icon: '/icons/nodejs.svg',
    color: '#339933',
    description: 'JavaScript 런타임',
    tagName: 'Node.js',
  },
  {
    id: '6',
    name: 'Java',
    icon: '/icons/java.svg',
    color: '#007396',
    description: '객체지향 언어',
    tagName: 'Java',
  },
  {
    id: '7',
    name: 'Spring Boot',
    icon: '/icons/spring-boot.svg',
    color: '#6DB33F',
    description: 'Java 프레임워크',
    tagName: 'Spring Boot',
  },
  {
    id: '8',
    name: 'Python',
    icon: '/icons/python.svg',
    color: '#3776AB',
    description: '다목적 언어',
    tagName: 'Python',
  },
  {
    id: '9',
    name: 'NestJS',
    icon: '/icons/nestjs.svg',
    color: '#E0234E',
    description: 'Node.js 프레임워크',
    tagName: 'NestJS',
  },
  {
    id: '10',
    name: 'Flutter',
    icon: '/icons/flutter.svg',
    color: '#02569B',
    description: '크로스플랫폼',
    tagName: 'Flutter',
  },
  {
    id: '11',
    name: 'React Native',
    icon: '/icons/react.svg',
    color: '#61DAFB',
    description: '모바일 개발',
    tagName: 'React Native',
  },
  {
    id: '12',
    name: 'MongoDB',
    icon: '/icons/mongodb.svg',
    color: '#47A248',
    description: 'NoSQL 데이터베이스',
    tagName: 'MongoDB',
  },
  {
    id: '13',
    name: 'PostgreSQL',
    icon: '/icons/postgresql.svg',
    color: '#336791',
    description: 'SQL 데이터베이스',
    tagName: 'PostgreSQL',
  },
  {
    id: '14',
    name: 'Redis',
    icon: '/icons/redis.svg',
    color: '#DC382D',
    description: '인메모리 DB',
    tagName: 'Redis',
  },
  {
    id: '15',
    name: 'Docker',
    icon: '/icons/docker.svg',
    color: '#2496ED',
    description: '컨테이너 플랫폼',
    tagName: 'Docker',
  },
  {
    id: '16',
    name: 'AWS',
    icon: '/icons/aws.svg',
    color: '#FF9900',
    description: '클라우드 서비스',
    tagName: 'AWS',
  },
  {
    id: '17',
    name: 'Kubernetes',
    icon: '/icons/kubernetes.svg',
    color: '#326CE5',
    description: '컨테이너 오케스트레이션',
    tagName: 'Kubernetes',
  },
  {
    id: '18',
    name: 'GraphQL',
    icon: '/icons/graphql.svg',
    color: '#E10098',
    description: 'API 쿼리 언어',
    tagName: 'GraphQL',
  },
  {
    id: '19',
    name: 'Tailwind',
    icon: '/icons/tailwind.svg',
    color: '#06B6D4',
    description: 'CSS 프레임워크',
    tagName: 'Tailwind CSS',
  },
  {
    id: '20',
    name: 'HTML',
    icon: '/icons/html5.svg',
    color: '#E34F26',
    description: '마크업 언어',
    tagName: 'HTML',
  },
];

export function FlipHexTechStack() {
  const resizeRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { positions, honeycombWidth } = useMemo(() => {
    const positions = getHoneycombPositions(techStacks.length);
    const radius = 48;
    const maxX = Math.max(...positions.map((pos) => pos.x));
    const honeycombWidth = maxX + radius;

    return { positions, honeycombWidth };
  }, [techStacks.length]);

  const centerX = useRefCenter(resizeRef, honeycombWidth);

  // 👈 초기화 완료 체크
  useEffect(() => {
    if (centerX !== 0) {
      setIsInitialized(true);
    }
  }, [centerX]);

  useEffect(() => {
    if (!resizeRef.current || !isInitialized) return;

    const state = Flip.getState('.hex-card');
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.8,
        ease: 'power2.inOut',
        absolute: true,
      });
    });
  }, [centerX, isInitialized]);

  return (
    <div className={cn(`relative ml-10 max-lg:hidden`)}>
      {/* 그라데이션 */}
      <div className="from-background via-background/80 pointer-events-none absolute top-0 left-0 z-30 h-full w-10 bg-gradient-to-r to-transparent" />
      <div className="from-background via-background/80 pointer-events-none absolute top-0 right-0 z-30 h-full w-10 bg-gradient-to-l to-transparent" />

      <div className="flex h-[280px] w-full flex-col justify-center">
        {/* 허니콤 패턴 컨테이너 */}
        <div ref={resizeRef} className="flex h-full overflow-x-auto pt-3">
          <div
            className="relative flex"
            // 👈 초기화 전까지 숨김
            style={{ opacity: isInitialized ? 1 : 0 }}
          >
            {techStacks.map((tech, index) => {
              const position = positions[index];
              return (
                <div
                  key={tech.id}
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
