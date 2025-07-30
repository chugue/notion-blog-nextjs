'use client';

import React from 'react';
import { useActiveHeading } from '../../../presentation/hooks/blog/use-active-heading';
import { TocEntry } from '@stefanprobst/rehype-extract-toc';
import { TableOfContentsLink } from './TableOfContentsLink';

const TableOfContentsWrapper = ({ toc }: { toc: TocEntry[] }) => {
  const activeHeading = useActiveHeading();

  return (
    <aside className="ml-10 hidden justify-self-start md:block">
      <div className="sticky top-[var(--sticky-top)] mt-[var(--sticky-toc-offset)] self-start border-l-1 border-black/50 dark:border-white/50">
        <nav className="space-y-3 overflow-y-auto text-sm">
          <h2 className="mb-2 pl-4 text-sm font-bold">목차</h2>
          {toc.map((item) => {
            return <TableOfContentsLink key={item.id} item={item} activeHeading={activeHeading} />;
          })}
        </nav>
      </div>
    </aside>
  );
};

export default TableOfContentsWrapper;
