'use client';

import LocomotiveScroll from 'locomotive-scroll';
import { useEffect, useRef } from 'react';

const useSmoothScroll = (selctor = '.notion-page') => {
  const locoRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      const el = document.querySelector(selctor) as HTMLElement | null;

      if (!el || !mounted) return;

      locoRef.current = new LocomotiveScroll({
        el,
        smooth: true,
        smartphone: { smooth: true, breakpoint: 375 },
        tablet: { smooth: true, breakpoint: 1024 },
      });
    })();

    const onResize = () => locoRef.current?.update();
    window.addEventListener('resize', onResize);

    return () => {
      mounted = false;
      locoRef.current?.destroy();
      locoRef.current = null;
    };
  }, [selctor]);

  return locoRef;
};

export default useSmoothScroll;
