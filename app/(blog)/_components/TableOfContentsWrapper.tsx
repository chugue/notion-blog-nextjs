'use client';

import React from 'react';
import { useActiveHeading } from '../_hooks/useActiveHeading';
import { TocEntry } from '@stefanprobst/rehype-extract-toc';
import { TableOfContentsLink } from './TableOfContentsLink';

const TableOfContentsWrapper = ({ toc }: { toc: TocEntry[] }) => {
  const activeHeading = useActiveHeading();

  return (
    <>
      {toc.map((item) => (
        <TableOfContentsLink key={item.id} item={item} activeHeading={activeHeading} />
      ))}
    </>
  );
};

export default TableOfContentsWrapper;
