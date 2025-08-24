import { gsap } from 'gsap';
import { useEffect } from 'react';

interface UseHeaderScrollAnimationProps {
  headerRef: React.RefObject<HTMLElement | null>;
}

export const useHeaderScrollAnimation = ({ headerRef }: UseHeaderScrollAnimationProps) => {
  useEffect(() => {
    if (!headerRef.current) return;

    const header = headerRef.current;
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const screenWidth = window.innerWidth;

      if (screenWidth > 376) {
        gsap.set(header, { y: '0%' });
        return;
      }

      const shouldHideHeader = currentScrollY > 100 && currentScrollY > lastScrollY;
      const targetY = shouldHideHeader ? '-100%' : '0%';

      gsap.to(header, { y: targetY, duration: 0.3 });
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headerRef]);

  return;
};
