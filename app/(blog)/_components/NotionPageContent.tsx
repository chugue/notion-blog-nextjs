'use client';

import { HighlightedCodeMap } from '@/presentation/utils/highlight-code-blocks';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Block, ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import CustomCodeBlock from './CustomCodeBlock';
import { HighlightedCodeProvider } from './HighlightedCodeContext';

// 데이터베이스 컴포넌트 동적 로드
const Collection = dynamic(() => import('react-notion-x/build/third-party/collection').then((m) => m.Collection), {
    ssr: false,
});

const mapImageUrl = (url: string | undefined, block: Block): string => {
    if (!url) return '';

    // 상대 경로나 data URL은 그대로
    if (url.startsWith('/') || url.startsWith('data:')) {
        return url;
    }

    // attachment: 스킴은 Notion 이미지 URL로 변환
    if (url.startsWith('attachment:')) {
        const notionImageUrl = `https://www.notion.so/image/${encodeURIComponent(url)}?table=block&id=${block.id}`;
        return `/api/notion-image?url=${encodeURIComponent(notionImageUrl)}`;
    }

    // 모든 외부 이미지는 프록시를 통해 제공 (referrer 정책 우회)
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
                    mapPageUrl={() => '#'}
                    mapImageUrl={mapImageUrl}
                    components={{
                        nextImage: Image,
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
