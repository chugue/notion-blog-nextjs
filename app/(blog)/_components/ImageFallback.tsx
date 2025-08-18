import React from 'react';

const ImageFallback = () => {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute inset-0 z-10 block">
        <span className="block h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </span>
    </span>
  );
};

export default ImageFallback;
