'use client';

import React from 'react';
import { OgObject } from 'open-graph-scraper/types';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const fetchOGData = async (url: string): Promise<OgObject> => {
  const response = await fetch(`/api/open-graph?url=${encodeURIComponent(url)}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch OpenGraph data');
  }

  return result.data;
};

const BookmarkCard = ({ href }: { href: string }) => {
  const {
    data: ogData,
    isPending,
    error,
  } = useQuery({
    queryKey: ['open-graph', href],
    queryFn: () => fetchOGData(href),
    enabled: !!href,
    staleTime: 1000 * 60 * 5,
  });

  if (isPending) return <LoadingSpinner />;
  if (error) throw error.message;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="-mt-8 flex h-40 gap-4 rounded-lg border transition-shadow hover:shadow-md"
    >
      <span className="flex min-w-0 flex-1 flex-col justify-center p-4">
        <span className="mb-2 line-clamp-1 text-lg font-semibold">{ogData.ogTitle || href}</span>
        {ogData.ogDescription && (
          <span className="mb-2 line-clamp-3 text-sm text-gray-600">{ogData.ogDescription}</span>
        )}
        <span className="text-sm text-blue-500">{ogData.ogSiteName || new URL(href).hostname}</span>
      </span>
      {ogData.ogImage?.[0]?.url && (
        <span className="relative w-80 flex-shrink-0">
          <Image
            src={`/api/image-proxy?url=${encodeURIComponent(ogData.ogImage[0].url)}`}
            alt={ogData.ogImage[0].alt || ogData.ogTitle || '북마크 이미지'}
            fill
            className="rounded object-cover object-center"
            sizes="128px"
          />
        </span>
      )}
    </a>
  );
};

export default BookmarkCard;
