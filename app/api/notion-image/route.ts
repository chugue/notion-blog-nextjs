import { fetchImageWithRetry, isGif } from '@/shared/utils/notion-image-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const encodedUrl = request.nextUrl.searchParams.get('url');

    if (!encodedUrl) {
        return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    try {
        const imageUrl = decodeURIComponent(encodedUrl);

        console.log('[notion-image] Fetching:', imageUrl);

        const imageResponse = await fetchImageWithRetry(imageUrl, { logPrefix: '[notion-image]' });

        if (!imageResponse.ok) {
            console.error('[notion-image] Failed:', imageUrl, 'Status:', imageResponse.status);
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
        }

        const contentType = imageResponse.headers.get('Content-Type') || 'image/png';
        const isGifImage = isGif(imageUrl, contentType);

        // GIF는 전체 버퍼를 받아서 반환 (짤림 방지)
        if (isGifImage) {
            console.log('[notion-image] GIF detected, fetching full buffer...');
            const buffer = await imageResponse.arrayBuffer();

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': buffer.byteLength.toString(),
                    'Cache-Control': 'no-store, must-revalidate',
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
        console.error('[notion-image] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
