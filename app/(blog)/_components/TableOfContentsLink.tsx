'use client';

import { cn } from '@/shared/utils/tailwind-cn';
import { TocEntry } from '@stefanprobst/rehype-extract-toc';
import Link from 'next/link';

interface TableOfContentsLinkProps {
  item: TocEntry;
  activeHeading?: string;
}

export function TableOfContentsLink({ item, activeHeading }: TableOfContentsLinkProps) {
  const isActive = activeHeading === item.id;
  return (
    <div className="space-y-2 pl-2">
      <Link
        key={item.id}
        href={`#${item.id}`}
        className={cn('block pl-4 font-bold transition-all duration-300', {
          'text-primary scale-105': isActive,
          'text-muted-foreground hover:text-foreground': !isActive,
        })}
      >
        {item.value}
      </Link>
      {item.children && item.children.length > 0 && (
        <div className="space-y-2 pl-4">
          {item.children.map((subItem) => (
            <TableOfContentsLink key={subItem.id} item={subItem} activeHeading={activeHeading} />
          ))}
        </div>
      )}
    </div>
  );
}
