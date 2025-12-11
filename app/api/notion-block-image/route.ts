import { notionAPI } from '@/infrastructure/database/external-api/notion-client';
import { NextRequest, NextResponse } from 'next/server';

const BROWSER_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// URL이나 Content-Type으로 GIF인지 확인
function isGif(url: string, contentType: string | null): boolean {
    const urlLower = url.toLowerCase();
    const isGifUrl = urlLower.includes('.gif') || urlLower.includes('%2Egif');
    const isGifContentType = contentType?.includes('image/gif') ?? false;
    return isGifUrl || isGifContentType;
}

// attachment: URL을 Notion 영구 URL로 변환
function convertToNotionImageUrl(url: string, blockId: string, spaceId?: string): string {
    // 이미 HTTP URL이면 그대로 반환
    if (url.startsWith('http')) {
        return url;
    }

    // attachment: 스킴인 경우 Notion 영구 URL로 변환
    if (url.startsWith('attachment:')) {
        const encodedPath = encodeURIComponent(url);
        const params = new URLSearchParams({
            table: 'block',
            id: blockId,
        });
        if (spaceId) {
            params.set('spaceId', spaceId);
        }
        return `https://www.notion.so/image/${encodedPath}?${params.toString()}`;
    }

    return url;
}

async function fetchImageWithRetry(url: string, maxRetries = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': BROWSER_USER_AGENT,
                    Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                cache: 'no-store',
            });

            if (response.status === 503 && attempt < maxRetries) {
                console.log(`[notion-block-image] 503 received, retrying (${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
                console.log(`[notion-block-image] Fetch error, retrying (${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

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
        const imageResponse = await fetchImageWithRetry(fetchUrl);

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
