'use client';

import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import TableOfContentsWrapper from './TableOfContentsWrapper';

export const useHeaderPosition = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // 헤더 높이 측정
    const header = document.querySelector('header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const screenWidth = window.innerWidth;

      // 모바일에서만 헤더가 숨겨짐 (376px 이하)
      if (screenWidth <= 376) {
        const shouldHideHeader = currentScrollY > 100 && currentScrollY > lastScrollY;
        setIsHeaderVisible(!shouldHideHeader);
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // 목차의 top 위치 계산
  const getTocTopPosition = () => {
    if (window.innerWidth > 376) {
      // 데스크톱에서는 헤더가 항상 보임
      return headerHeight + 4; // 헤더 높이 + 16px
    } else {
      // 모바일에서는 헤더 가시성에 따라 조정
      return isHeaderVisible ? headerHeight + 4 : 4;
    }
  };

  return {
    isMounted,
    getTocTopPosition,
  };
};

const MobileToc = () => {
  const { getTocTopPosition, isMounted } = useHeaderPosition();

  useEffect(() => {
    if (!isMounted) return;

    gsap.to('#mobile-toc', {
      top: getTocTopPosition(),
      ease: 'power2.inOut',
      duration: 0.3,
    });
  }, [getTocTopPosition, isMounted]);

  return (
    <div className="sticky z-50 mb-6 md:hidden" id="mobile-toc">
      <details className="group bg-card/80 rounded-lg p-4 backdrop-blur-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold transition-all duration-300 ease-out [&::-webkit-details-marker]:hidden">
          목차
          <ChevronDown
            className="h-5 w-5 transition-transform duration-300 ease-out group-open:rotate-180"
            strokeWidth={3}
          />
        </summary>
        <nav className="mt-3 space-y-3 text-sm">
          <TableOfContentsWrapper isMobile={true} className="md:hidden" />
        </nav>
      </details>
    </div>
  );
};

export default MobileToc;
