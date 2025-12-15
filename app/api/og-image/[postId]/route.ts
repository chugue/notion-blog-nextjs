import { notion } from '@/infrastructure/database/external-api/notion-client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NextRequest, NextResponse } from 'next/server';

const BROWSER_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 커버 이미지의 원본 URL 추출 (fresh한 S3 서명 URL)
function getCoverImageUrl(cover: PageObjectResponse['cover']): string | null {
    if (!cover) return null;

    if (cover.type === 'external') {
        return cover.external.url;
    } else if (cover.type === 'file') {
        return cover.file.url; // fresh한 S3 서명 URL
    }

    return null;
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
                cache: 'no-store',
            });

            if (response.status === 503 && attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
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

        const imageResponse = await fetchWithRetry(imageUrl);

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
