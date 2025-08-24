'use client';

import { cn } from '@/shared/utils/tailwind-cn';
import { TocEntry } from '@stefanprobst/rehype-extract-toc';
import Link from 'next/link';

interface TableOfContentsLinkProps {
  item: TocEntry;
  activeHeading?: string;
  className?: string;
}

export function TableOfContentsLink({ item, activeHeading, className }: TableOfContentsLinkProps) {
  const isActive = activeHeading === item.id;
  return (
    <div className={cn('space-y-2 max-md:text-center md:pl-2', className)}>
      <Link
        key={item.id}
        href={`#${item.id}`}
        className={cn('block px-2 font-bold transition-all duration-300 md:pl-4', {
          'text-primary scale-105': isActive,
          'text-muted-foreground hover:text-foreground': !isActive,
        })}
      >
        {item.value}
      </Link>
      {item.children && item.children.length > 0 && (
        <div className={cn('space-y-2 max-md:text-center md:pl-2')}>
          {item.children.map((subItem) => (
            <TableOfContentsLink key={subItem.id} item={subItem} activeHeading={activeHeading} />
          ))}
        </div>
      )}
    </div>
  );
}
