'use client';

import React from 'react';
import Giscus from '@giscus/react';

const GiscusComments = () => {
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
      theme="light"
      lang="ko"
      loading="lazy"
    />
  );
};

export default GiscusComments;
