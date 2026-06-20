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

    // GIF는 next/image 최적화를 거치면 정지 프레임이 되거나 깨진다.
    // 프록시로 fresh 원본(raw)을 받되, NotionImage에서 unoptimized로 렌더하도록 표시(gif=1).
    if (url.includes('.gif')) {
        return `/api/notion-block-image?blockId=${block.id}&gif=1`;
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
    // 렌더 루트 블록 id. 미지정 시 react-notion-x는 block의 "첫 키"를 루트로 삼는데,
    // recordMap이 jsonb 등으로 직렬화되며 키 순서가 바뀌면 엉뚱한 블록이 루트가 되어
    // 본문이 비어 보인다. 포스트 id를 명시해 키 순서와 무관하게 올바른 루트를 고정한다.
    pageId?: string;
}

const NotionPageContent = ({
    recordMap,
    highlightedCode = {},
    pageId,
}: NotionPageContentProps) => {
    return (
        <HighlightedCodeProvider highlightedCode={highlightedCode}>
            <div className="flex">
                <NotionRenderer
                    recordMap={recordMap}
                    rootPageId={pageId}
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
