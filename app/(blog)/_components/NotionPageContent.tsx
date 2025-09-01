'use client';

import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import CustomCodeBlock from './CustomCodeBlock';

const NotionPageContent = ({ pageId }: { pageId: string }) => {
  const {
    data: recordMap,
    isFetched,
    error,
  } = useQuery<ExtendedRecordMap | null>({
    queryKey: ['notionPage', pageId],
    queryFn: async () => {
      const res = await fetch(`/api/notion/page?pageId=${pageId}`, {
        next: {
          revalidate: 60 * 60 * 24,
        },
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message);
      }
      return json.data as ExtendedRecordMap;
    },
    enabled: !!pageId,
    retry: 1,
  });

  if (!isFetched)
    return (
      <div className="flex h-[20vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return <div className="flex items-center justify-center">페이지를 불러오지 못했습니다.</div>;

  return (
    <div className="flex">
      <NotionRenderer
        recordMap={recordMap as ExtendedRecordMap}
        fullPage={false}
        darkMode={true}
        disableHeader={true}
        previewImages={true}
        mapPageUrl={() => '#'}
        components={{
          nextImage: Image,
          nextLink: Link,
          Code: CustomCodeBlock,
        }}
      />
    </div>
  );
};

export default NotionPageContent;
