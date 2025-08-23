'use client';

import { useActiveHeading } from '@/presentation/hooks/blog/use-active-heading';
import { useTocList } from '@/presentation/hooks/blog/use-toc-list';
import { TableOfContentsLink } from './TableOfContentsLink';

export interface TocItem {
  id: string;
  value: string;
  depth: number;
  children: TocItem[];
}

const TableOfContentsWrapper = () => {
  const { toc } = useTocList();
  const activeHeading = useActiveHeading();

  return (
    <aside className="ml-10 hidden size-full justify-self-start md:block">
      <div className="sticky top-[var(--sticky-top)] mt-[var(--sticky-toc-offset)] self-start border-l-2 border-black/50 dark:border-white/50">
        <nav className="space-y-3 overflow-hidden">
          <h2 className="mb-2 pl-4 text-xl font-bold">목차</h2>
          {toc.length > 0 &&
            toc.map((item: TocItem) => {
              return (
                <TableOfContentsLink key={item.id} item={item} activeHeading={activeHeading} />
              );
            })}
        </nav>
      </div>
    </aside>
  );
};

export default TableOfContentsWrapper;
