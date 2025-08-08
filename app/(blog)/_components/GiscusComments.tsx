'use client';

import React from 'react';
import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

interface GiscusCommentsProps {
  term: string;
}

const GiscusComments = ({ term }: GiscusCommentsProps) => {
  const { theme } = useTheme();

  return (
    <Giscus
      repo="chugue/notion-blog-nextjs-giscus"
      repoId="R_kgDOPN-hOQ"
      categoryId="DIC_kwDOPN-hOc4CtEbo"
      mapping="specific"
      strict="0"
      term={term}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'dark' ? 'dark' : 'noborder_light'}
      lang="ko"
    />
  );
};

export default GiscusComments;
