'use client';

import React from 'react';
import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

const GiscusComments = () => {
  const { theme } = useTheme();

  return (
    <Giscus
      repo="chugue/notion-blog-nextjs-giscus"
      repoId="R_kgDOPN-hOQ"
      category="Announcements"
      categoryId="DIC_kwDOPN-hOc4CtEbo"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'dark' ? 'dark' : 'noborder_light'}
      lang="ko"
    />
  );
};

export default GiscusComments;
