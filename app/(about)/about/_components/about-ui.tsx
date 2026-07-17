'use client';

import { useEffect, useRef } from 'react';
import { useCountUp } from '../_hooks/use-count-up';
import { ScrollRevealItem } from './scroll-reveal';

/* ───────── Dot Grid Background ───────── */
export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      draw();
    };

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gap = 28;
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.04)';
          ctx.fill();
        }
      }
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}

/* ───────── Dot Decoration ───────── */
export function DotPattern({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-1 opacity-15 ${className}`}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-primary h-1 w-1 rounded-full" />
      ))}
    </div>
  );
}

/* ───────── Section Title (scroll-driven) ───────── */
export function SectionTitle({
  children,
  index = 0,
  total = 1,
}: {
  children: React.ReactNode;
  index?: number;
  total?: number;
}) {
  return (
    <ScrollRevealItem index={index} total={total} direction="left">
      <h2 className="mb-10 flex items-center gap-3 text-2xl font-bold tracking-tight">
        <span className="bg-primary inline-block h-2.5 w-2.5 rounded-full" />
        {children}
      </h2>
    </ScrollRevealItem>
  );
}

/* ───────── StatCard ───────── */
export function StatCard({
  target,
  suffix,
  label,
  sub,
  index,
  total,
}: {
  target: number;
  suffix: string;
  label: string;
  sub: string;
  index: number;
  total: number;
}) {
  const { ref, display } = useCountUp(target, suffix, 2);

  return (
    <ScrollRevealItem index={index} total={total}>
      <div
        ref={ref}
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-8 text-center backdrop-blur-sm md:py-10"
      >
        <div className="text-primary mb-2 text-4xl font-bold md:text-5xl">
          {display}
        </div>
        <div className="text-sm font-semibold text-neutral-200">{label}</div>
        <div className="mt-0.5 text-xs text-neutral-500">{sub}</div>
        <DotPattern className="absolute -right-1 -top-1" />
      </div>
    </ScrollRevealItem>
  );
}
