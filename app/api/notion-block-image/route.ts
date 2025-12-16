import { notionAPI } from '@/infrastructure/database/external-api/notion-client';
import {
    convertToNotionImageUrl,
    fetchImageWithRetry,
    isGif,
} from '@/shared/utils/notion-image-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const blockId = request.nextUrl.searchParams.get('blockId');

    if (!blockId) {
        return NextResponse.json({ error: 'blockId is required' }, { status: 400 });
    }

    try {
        console.log('[notion-block-image] Fetching fresh URL for block:', blockId);

        // Notion API로 해당 블록의 fresh signed URL 가져오기
        const recordMap = await notionAPI.getPage(blockId);
        const block = recordMap.block[blockId]?.value;

        if (!block) {
            console.error('[notion-block-image] Block not found:', blockId);
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        // 1. signed_urls에서 먼저 가져오기 (notion-client가 자동으로 fresh signed URL 제공)
        let imageUrl: string | null = null;
        const signedUrls = recordMap.signed_urls;
        if (signedUrls && signedUrls[blockId]) {
            imageUrl = signedUrls[blockId];
            console.log('[notion-block-image] Using signed_urls');
        }

        // 2. signed_urls에 없으면 블록에서 직접 추출
        if (!imageUrl && block.type === 'image') {
            // format.display_source가 보통 signed URL
            if (block.format?.display_source) {
                imageUrl = block.format.display_source;
                console.log('[notion-block-image] Using format.display_source');
            }
            // properties.source는 attachment: URL일 수 있음
            if (!imageUrl) {
                const source = block.properties?.source?.[0]?.[0];
                if (source) {
                    imageUrl = source;
                    console.log('[notion-block-image] Using properties.source');
                }
            }
        }

        // 3. 북마크 블록의 커버 이미지 처리
        if (!imageUrl && block.type === 'bookmark') {
            if (block.format?.bookmark_cover) {
                imageUrl = block.format.bookmark_cover;
                console.log('[notion-block-image] Using bookmark_cover');
            }
        }

        if (!imageUrl) {
            console.error('[notion-block-image] Image URL not found in block:', blockId);
            return NextResponse.json({ error: 'Image URL not found' }, { status: 404 });
        }

        // spaceId 추출 (block에서)
        const spaceId = block.space_id;

        // attachment: 스킴이면 Notion 영구 URL로 변환
        const fetchUrl = convertToNotionImageUrl(imageUrl, blockId, spaceId);

        console.log('[notion-block-image] Fresh URL obtained:', fetchUrl.substring(0, 100) + '...');

        // 이미지 fetch
        const imageResponse = await fetchImageWithRetry(fetchUrl, {
            logPrefix: '[notion-block-image]',
        });

        if (!imageResponse.ok) {
            console.error('[notion-block-image] Failed to fetch image:', imageResponse.status);
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
        }

        const contentType = imageResponse.headers.get('Content-Type') || 'image/png';
        // 원본 URL과 fetchUrl 둘 다 체크 (attachment: URL에서 확장자 확인)
        const isGifImage = isGif(imageUrl, contentType) || isGif(fetchUrl, contentType);

        // GIF는 전체 버퍼를 받아서 반환 (짤림 방지)
        if (isGifImage) {
            console.log('[notion-block-image] GIF detected, fetching full buffer...');
            const buffer = await imageResponse.arrayBuffer();

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': buffer.byteLength.toString(),
                    'Cache-Control': 'no-store, must-revalidate',
                },
            });
        }

        // 일반 이미지
        const buffer = await imageResponse.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=3600', // 1시간 캐시 (signed URL 만료 전)
            },
        });
    } catch (error) {
        console.error('[notion-block-image] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
