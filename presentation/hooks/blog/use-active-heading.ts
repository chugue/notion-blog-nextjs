'use client';

import { useEffect, useState } from 'react';

export function useActiveHeading(): string {
  const [activeHeading, setActiveHeading] = useState<string>('');

  useEffect(() => {
    let handleScroll: (() => void) | null = null;
    let observer: MutationObserver | null = null;

    const createUpdateFn = (getHeadings: () => Element[]) => {
      return () => {
        const headings = getHeadings();
        if (headings.length === 0) {
          setActiveHeading('');
          return;
        }

        const scrollY = window.scrollY;
        const offset = window.innerHeight * 0.6;

        let currentHeading = '';

        headings.forEach((heading) => {
          const dataId = heading.getAttribute('data-id');
          if (!dataId) return;

          const rect = heading.getBoundingClientRect();
          const elementTop = rect.top + scrollY;

          if (elementTop <= scrollY + offset) {
            currentHeading =
              dataId || heading.querySelector('.notion-header-anchor')?.getAttribute('id') || '';
          }
        });

        setActiveHeading(currentHeading);
      };
    };

    const init = (): boolean => {
      const contentArea = document.querySelector('.notion-page');
      if (!contentArea) return false;

      // 각 호출 시점에 최신 헤딩을 조회하도록 함
      const getHeadings = () =>
        Array.from(contentArea.querySelectorAll('.notion-h1, .notion-h2, .notion-h3'));

      const updateActiveHeading = createUpdateFn(getHeadings);

      // 등록된 스크롤 핸들러가 있으면 제거 후 재등록
      if (handleScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
      handleScroll = () => {
        requestAnimationFrame(updateActiveHeading);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      // 초기 한 번 실행
      setTimeout(updateActiveHeading, 50);

      return true;
    };

    // 즉시 초기화 시도, 실패하면 MutationObserver로 기다림
    if (!init()) {
      observer = new MutationObserver(() => {
        if (init() && observer) {
          observer.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (observer) observer.disconnect();
      if (handleScroll) window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return activeHeading;
}
