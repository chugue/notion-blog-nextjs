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

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': BROWSER_USER_AGENT,
                    Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                cache: 'no-store', // 항상 fresh하게 가져오기
            });

            // 503은 재시도, 다른 에러는 바로 반환
            if (response.status === 503 && attempt < maxRetries) {
                console.log(`[notion-image] 503 received, retrying (${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
                console.log(`[notion-image] Fetch error, retrying (${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

export async function GET(request: NextRequest) {
    const encodedUrl = request.nextUrl.searchParams.get('url');

    if (!encodedUrl) {
        return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    try {
        const imageUrl = decodeURIComponent(encodedUrl);

        console.log('[notion-image] Fetching:', imageUrl);

        const imageResponse = await fetchWithRetry(imageUrl);

        if (!imageResponse.ok) {
            console.error('[notion-image] Failed:', imageUrl, 'Status:', imageResponse.status);
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
        }

        const contentType = imageResponse.headers.get('Content-Type') || 'image/png';
        const isGifImage = isGif(imageUrl, contentType);

        // GIF는 전체 버퍼를 받아서 반환 (짤림 방지)
        // 일반 이미지는 스트리밍으로 반환
        if (isGifImage) {
            console.log('[notion-image] GIF detected, fetching full buffer...');
            const buffer = await imageResponse.arrayBuffer();

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': buffer.byteLength.toString(),
                    'Cache-Control': 'no-store, must-revalidate', // GIF는 캐시하지 않음
                },
            });
        }

        // 일반 이미지는 스트리밍 + 캐시
        return new NextResponse(imageResponse.body, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Notion image proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
