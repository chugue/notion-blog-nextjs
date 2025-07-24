'use client';

import { useEffect, useState } from 'react';

export function useActiveHeading(): string {
  const [activeHeading, setActiveHeading] = useState<string>('');

  useEffect(() => {
    const contentArea = document.querySelector('.prose');
    if (!contentArea) return;

    const headings = contentArea.querySelectorAll('h1, h2, h3');

    if (headings.length === 0) return;

    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const offset = window.innerHeight * 0.3;

      let currentHeading = '';

      headings.forEach((heading) => {
        if (!heading.id) return;

        const rect = heading.getBoundingClientRect();
        const elementTop = rect.top + scrollY;

        if (elementTop <= scrollY + offset) {
          currentHeading = heading.id;
        }
      });

      setActiveHeading(currentHeading);
    };

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
