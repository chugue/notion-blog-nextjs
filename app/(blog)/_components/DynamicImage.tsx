'use client';

import { convertS3UrlToNotionUrl } from '@/domain/utils/post.utils';
import Image from 'next/image';
import React from 'react';

const DynamicImage = ({
  src,
  alt,
  width,
  height,
  pageId,
}: React.ImgHTMLAttributes<HTMLImageElement> & { pageId: string }) => {
  const rawSrc = typeof src === 'string' ? src : '/images/no-image-dark.png';
  const isGIf = typeof src === 'string' && src.includes('.gif');
  const imageWidth = width ? Number(width) : 800;
  const imageHeight = height ? Number(height) : 400;

  const proxiedSrc = isGIf ? `${rawSrc}` : convertS3UrlToNotionUrl(rawSrc, pageId);

  return (
    <Image
      src={proxiedSrc ?? ''}
      alt={alt || ''}
      width={imageWidth}
      height={imageHeight}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      className={`'opacity-0 mt-8 mb-8 w-full rounded-lg opacity-100 shadow-sm transition-shadow hover:shadow-md`}
      unoptimized={isGIf}
      loading="eager"
    />
  );
};

export default DynamicImage;
