'use client';

import Image from 'next/image';
import React, { useState } from 'react';

const DynamicImage = ({ src, alt, width, height }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoading, setIsLoading] = useState(true);
  const rawSrc = typeof src === 'string' ? src : '/images/no-image-dark.png';
  const isAnimated = typeof src === 'string' && src.includes('.gif');
  const imageWidth = width ? Number(width) : 800;
  const imageHeight = height ? Number(height) : 400;

  return (
    <span className="relative block">
      {isLoading && (
        <span className="absolute inset-0 z-10 block">
          <span className="block h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </span>
      )}
      <Image
        src={rawSrc}
        alt={alt || ''}
        width={imageWidth}
        height={imageHeight}
        className={`mt-8 mb-8 w-full rounded-lg shadow-sm transition-shadow hover:shadow-md ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        unoptimized={isAnimated}
        loading="eager"
        onLoad={() => setIsLoading(false)}
      />
    </span>
  );
};

export default DynamicImage;
