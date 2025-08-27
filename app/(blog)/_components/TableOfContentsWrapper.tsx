'use client';

import { useActiveHeading } from '@/presentation/hooks/blog/use-active-heading';
import { useTocList } from '@/presentation/hooks/blog/use-toc-list';
import { cn } from '@/shared/utils/tailwind-cn';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { TableOfContentsLink } from './TableOfContentsLink';

export interface TocItem {
  id: string;
  value: string;
  depth: number;
  children: TocItem[];
}

interface TableOfContentsWrapperProps {
  isMobile?: boolean;
  className?: string;
}

const TableOfContentsWrapper = ({ isMobile, className }: TableOfContentsWrapperProps) => {
  const { toc } = useTocList();
  const activeHeading = useActiveHeading();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (toc.length === 0 || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const links = gsap.utils.toArray('.items');
      if (!links.length) return;

      gsap.fromTo(
        links,
        {
          opacity: 0,
          x: 50,
        },
        {
          opacity: 1,
          x: 0,
          stagger: 0.05,
          duration: 1,
          ease: 'power4.out',
        }
      );
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          x: 50,
        },
        {
          opacity: 1,
          duration: 1,
          x: 0,
          ease: 'power4.out',
        }
      );
    });
  }, [toc.length]);

  if (isMobile) {
    return (
      <aside className={cn('size-full justify-center', className)}>
        <div className="self-center">
          <nav className="space-y-3 overflow-hidden">
            {toc.length > 0 &&
              toc.map((item: TocItem) => (
                <TableOfContentsLink
                  key={item.id}
                  item={item}
                  activeHeading={activeHeading}
                  className="justify-center opacity-0"
                />
              ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className={'ml-10 hidden size-full justify-self-start md:block'}>
      <div
        ref={containerRef}
        className="sticky top-[var(--sticky-top)] mt-[var(--sticky-toc-offset)] self-start border-l-2 border-black/50 opacity-0 transition-all dark:border-white/50"
      >
        <nav className="space-y-3 overflow-hidden">
          <h2 className="mb-2 pl-4 text-xl font-bold">목차</h2>
          {toc.length > 0 &&
            toc.map((item: TocItem) => (
              <TableOfContentsLink
                key={item.id}
                item={item}
                activeHeading={activeHeading}
                className="items"
              />
            ))}
        </nav>
      </div>
    </aside>
  );
};

export default TableOfContentsWrapper;
