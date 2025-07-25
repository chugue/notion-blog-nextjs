import { useEffect, useState } from 'react';
import { Flip } from 'gsap/Flip';

export const useHoneycombInit = (
  centerX: number,
  resizeRef: React.RefObject<HTMLElement | null>
) => {
  const [isInitialized, setIsInitialized] = useState(false);

  //  초기화 완료 체크
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

  return isInitialized;
};
