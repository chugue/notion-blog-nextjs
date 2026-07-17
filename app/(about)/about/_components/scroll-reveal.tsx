'use client';

import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { createContext, useContext, useRef } from 'react';

/* ───────── Context ───────── */
const ScrollContext = createContext<MotionValue<number> | null>(null);

/* ───────── PinnedSection ─────────
   Wraps children in a tall scroll container with sticky inner content.
   Provides scrollYProgress to children via context.
   ─────────────────────────────────── */
export function PinnedSection({
  children,
  className = '',
  id,
  scrollHeight = '200vh',
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  scrollHeight?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <ScrollContext.Provider value={scrollYProgress}>
      <div
        ref={containerRef}
        id={id}
        className="relative"
        style={{ height: scrollHeight }}
      >
        <div className="sticky top-0 flex min-h-[100dvh] items-center">
          <div
            className={`relative z-10 mx-auto w-full max-w-4xl px-6 lg:px-0 ${className}`}
          >
            {children}
          </div>
        </div>
      </div>
    </ScrollContext.Provider>
  );
}

/* ───────── ScrollRevealItem ─────────
   Maps its index/total to a scroll progress slice.
   Each item fades+slides in at its own point in the scroll.
   ─────────────────────────────────── */
export function ScrollRevealItem({
  children,
  index,
  total,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  index: number;
  total: number;
  className?: string;
  direction?: 'up' | 'left' | 'right';
}) {
  const scrollYProgress = useContext(ScrollContext);
  if (!scrollYProgress) return <div className={className}>{children}</div>;

  const rangeStart = 0.05;
  const rangeEnd = 0.55;
  const sliceWidth = 0.12;
  const itemStart =
    rangeStart + (index / Math.max(total - 1, 1)) * (rangeEnd - rangeStart);
  const itemEnd = Math.min(itemStart + sliceWidth, 1);

  return (
    <ScrollRevealMotion
      scrollYProgress={scrollYProgress}
      itemStart={itemStart}
      itemEnd={itemEnd}
      className={className}
      direction={direction}
    >
      {children}
    </ScrollRevealMotion>
  );
}

/* Inner component to safely call hooks unconditionally */
function ScrollRevealMotion({
  children,
  scrollYProgress,
  itemStart,
  itemEnd,
  className,
  direction,
}: {
  children: React.ReactNode;
  scrollYProgress: MotionValue<number>;
  itemStart: number;
  itemEnd: number;
  className: string;
  direction: 'up' | 'left' | 'right';
}) {
  const opacity = useTransform(scrollYProgress, [itemStart, itemEnd], [0, 1]);
  const y = useTransform(
    scrollYProgress,
    [itemStart, itemEnd],
    direction === 'up' ? [40, 0] : [0, 0],
  );
  const x = useTransform(
    scrollYProgress,
    [itemStart, itemEnd],
    direction === 'left' ? [-40, 0] : direction === 'right' ? [40, 0] : [0, 0],
  );

  return (
    <motion.div className={className} style={{ opacity, y, x }}>
      {children}
    </motion.div>
  );
}
