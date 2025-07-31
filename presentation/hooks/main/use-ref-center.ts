import { useEffect, useState } from 'react';

export const useRefCenter = (ref: React.RefObject<HTMLElement | null>, honeycombWidth: number) => {
  const [centerX, setCenterX] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const containerWidth = entries[0].contentRect.width;

      const newX = (containerWidth - honeycombWidth) / 2;
      setCenterX((prev) => (prev !== newX ? newX : prev));
    });

    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, [ref, honeycombWidth]);

  return centerX;
};
