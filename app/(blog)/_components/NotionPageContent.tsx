'use client';

import { HighlightedCodeMap } from '@/presentation/utils/highlight-code-blocks';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import NotionImage from './NotionImage';
import { Block, ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import CustomCodeBlock from './CustomCodeBlock';
import { HighlightedCodeProvider } from './HighlightedCodeContext';

// 데이터베이스 컴포넌트 동적 로드
const Collection = dynamic(() => import('react-notion-x/build/third-party/collection').then((m) => m.Collection), {
    ssr: false,
});

// Notion 내부 이미지인지 확인 (S3, file.notion.so, attachment:, notion.so)
const isNotionImage = (url: string): boolean => {
    return (
        url.includes('s3.us-west-2.amazonaws.com') ||
        url.includes('s3.amazonaws.com') ||
        url.includes('file.notion.so') ||
        url.includes('notion.so') ||
        url.startsWith('attachment:')
    );
};

const mapImageUrl = (url: string | undefined, block: Block): string => {
    if (!url) return '';

    // 상대 경로나 data URL은 그대로
    if (url.startsWith('/') || url.startsWith('data:')) {
        return url;
    }

    // 이미지 블록인 경우 항상 blockId로 fresh URL 요청
    // (캐시된 signed_urls가 만료되었을 수 있으므로)
    if (block.type === 'image') {
        return `/api/notion-block-image?blockId=${block.id}`;
    }

    // Notion 내부 이미지 URL은 blockId로 fresh URL 요청
    if (isNotionImage(url)) {
        return `/api/notion-block-image?blockId=${block.id}`;
    }

    // 기타 외부 이미지는 프록시를 통해 제공 (referrer 정책 우회)
    if (url.startsWith('http')) {
        return `/api/notion-image?url=${encodeURIComponent(url)}`;
    }

    return url;
};

interface NotionPageContentProps {
    recordMap: ExtendedRecordMap;
    highlightedCode?: HighlightedCodeMap;
}

const NotionPageContent = ({ recordMap, highlightedCode = {} }: NotionPageContentProps) => {
    return (
        <HighlightedCodeProvider highlightedCode={highlightedCode}>
            <div className="flex">
                <NotionRenderer
                    recordMap={recordMap}
                    fullPage={false}
                    darkMode={true}
                    disableHeader={true}
                    previewImages={true}
                    forceCustomImages={true}
                    mapPageUrl={() => '#'}
                    mapImageUrl={mapImageUrl}
                    components={{
                        nextImage: NotionImage,
                        nextLink: Link,
                        Code: CustomCodeBlock,
                        Collection,
                    }}
                />
            </div>
        </HighlightedCodeProvider>
    );
};

export default NotionPageContent;
