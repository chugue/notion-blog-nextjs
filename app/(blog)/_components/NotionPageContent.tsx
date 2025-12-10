'use client';

import { HighlightedCodeMap } from '@/presentation/utils/highlight-code-blocks';
import Image from 'next/image';
import Link from 'next/link';
import { Block, ExtendedRecordMap } from 'notion-types';
import { NotionRenderer } from 'react-notion-x';
import CustomCodeBlock from './CustomCodeBlock';
import { HighlightedCodeProvider } from './HighlightedCodeContext';

const mapImageUrl = (url: string | undefined, block: Block): string => {
    if (!url) return '';

    // GIF는 원본 URL 사용 (애니메이션 보존)
    if (url.includes('.gif')) {
        return url;
    }

    // Notion S3 signed URL인 경우 프록시 API 사용
    if (
        url.includes('secure.notion-static.com') ||
        url.includes('prod-files-secure') ||
        url.includes('s3.us-west-2.amazonaws.com')
    ) {
        return `/api/notion-image?blockId=${block.id}`;
    }

    // 외부 URL은 그대로 사용
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
                    }}
                />
            </div>
        </HighlightedCodeProvider>
    );
};

export default NotionPageContent;
