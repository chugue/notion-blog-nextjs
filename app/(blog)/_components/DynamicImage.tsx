'use client';

import Image from 'next/image';
import React from 'react';

const DynamicImage = ({ src, alt, width, height }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const rawSrc = typeof src === 'string' ? src : '/images/no-image-dark.png';
  const isAnimated = typeof src === 'string' && src.includes('.gif');
  // const imageSrc = convertToImageProxy(rawSrc);
  const imageWidth = width ? Number(width) : 800;
  const imageHeight = height ? Number(height) : 400;

  return (
    <Image
      src={rawSrc}
      alt={alt || ''}
      width={imageWidth}
      height={imageHeight}
      className="mt-8 mb-8 w-full rounded-lg shadow-sm transition-shadow hover:shadow-md"
      unoptimized={isAnimated}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2QOQvGQAAAABJRU5ErkJggg=="
    />
  );
};

export default DynamicImage;
