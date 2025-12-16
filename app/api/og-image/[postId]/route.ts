import { notion } from '@/infrastructure/database/external-api/notion-client';
import { fetchImageWithRetry } from '@/shared/utils/notion-image-utils';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NextRequest, NextResponse } from 'next/server';

// 커버 이미지의 원본 URL 추출 (fresh한 S3 서명 URL)
function getCoverImageUrl(cover: PageObjectResponse['cover']): string | null {
    if (!cover) return null;

    if (cover.type === 'external') {
        return cover.external.url;
    } else if (cover.type === 'file') {
        return cover.file.url;
    }

    return null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;

    if (!postId) {
        return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    try {
        // 캐시 우회: Notion API 직접 호출하여 fresh한 커버 이미지 URL 가져오기
        const page = await notion.pages.retrieve({ page_id: postId });

        if (!('cover' in page) || !page.cover) {
            return NextResponse.redirect(new URL('/images/main-thumbnail.png', request.url));
        }

        const imageUrl = getCoverImageUrl(page.cover as PageObjectResponse['cover']);

        if (!imageUrl) {
            return NextResponse.redirect(new URL('/images/main-thumbnail.png', request.url));
        }

        const imageResponse = await fetchImageWithRetry(imageUrl, { logPrefix: '[og-image]' });

        if (!imageResponse.ok) {
            console.error('[og-image] Failed to fetch:', imageUrl, 'Status:', imageResponse.status);
            return NextResponse.redirect(new URL('/images/main-thumbnail.png', request.url));
        }

        const contentType = imageResponse.headers.get('Content-Type') || 'image/png';
        const buffer = await imageResponse.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.byteLength.toString(),
                // OG 이미지는 캐시하되, 주기적으로 재검증
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('[og-image] Error:', error);
        return NextResponse.redirect(new URL('/images/main-thumbnail.png', request.url));
    }
}
