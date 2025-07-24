'use client';

import { useEffect, useState } from 'react';

export function useActiveHeading(): string {
  const [activeHeading, setActiveHeading] = useState<string>('');

  useEffect(() => {
    // 👈 블로그 콘텐츠 영역만 타겟
    const contentArea = document.querySelector('.prose');
    if (!contentArea) {
      console.log('🚨 .prose 영역을 찾을 수 없습니다');
      return;
    }

    const headings = contentArea.querySelectorAll('h1, h2, h3');
    console.log(
      '🔍 찾은 헤딩들:',
      Array.from(headings).map((h) => ({
        tag: h.tagName,
        id: h.id,
        text: h.textContent?.slice(0, 20),
      }))
    );

    if (headings.length === 0) {
      console.log('🚨 헤딩을 찾을 수 없습니다');
      return;
    }

    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const offset = window.innerHeight * 0.3;

      let currentHeading = '';

      headings.forEach((heading) => {
        if (!heading.id) return; // 👈 ID가 없는 헤딩 스킵

        const rect = heading.getBoundingClientRect();
        const elementTop = rect.top + scrollY;

        if (elementTop <= scrollY + offset) {
          currentHeading = heading.id;
        }
      });

      console.log('📍 현재 활성 헤딩:', currentHeading);
      setActiveHeading(currentHeading);
    };

    // 👈 초기 딜레이 추가 (MDX 렌더링 대기)
    const timer = setTimeout(() => {
      updateActiveHeading();
    }, 100);

    const handleScroll = () => {
      requestAnimationFrame(updateActiveHeading);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return activeHeading;
}
