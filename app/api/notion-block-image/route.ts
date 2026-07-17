import { getNotionPage, notion } from '@/infrastructure/database/external-api/notion-client';
import { NextRequest, NextResponse } from 'next/server';

// 바이트를 프록시하지 않고 매 요청마다 로드 가능한 URL로 302 리다이렉트만 한다.
// 브라우저/이미지 옵티마이저가 S3(또는 공개 호스트)에서 직접 받으므로,
// 비공식 recordMap이 주는 서명 없는 S3 URL(→403→502) 문제를 구조적으로 우회한다.
export async function GET(request: NextRequest) {
    const blockId = request.nextUrl.searchParams.get('blockId');

    // gif 파라미터는 이제 프론트(unoptimized 분기) 전용 — 이 라우트는 분기하지 않는다.

    if (!blockId) {
        return NextResponse.json({ error: 'blockId is required' }, { status: 400 });
    }

    // 서명된 S3 URL은 1시간 만료(X-Amz-Expires=3600)다. 30분 캐시면 캐시된 리다이렉트가
    // 항상 ≥30분의 서명 유효 마진을 남겨, 만료된 서명으로 리다이렉트되는 일이 없다.
    const redirectTo = (url: string) =>
        NextResponse.redirect(url, {
            status: 302,
            headers: { 'Cache-Control': 'public, max-age=1800' },
        });

    // 절대 http(s)여야 하고, 서명 없는 Notion S3 URL이면 로드 불가로 본다.
    // prod-files-secure.s3 / secure.notion-static.com 호스트인데 X-Amz- 서명이 없으면
    // 그대로 302하면 403이 나므로 스킵한다. attachment:도 로드 불가.
    const isLoadable = (u: string): boolean => {
        if (!/^https?:\/\//.test(u)) return false;

        const isNotionS3 =
            u.includes('prod-files-secure.s3') || u.includes('secure.notion-static.com');
        if (isNotionS3 && !u.includes('X-Amz-')) return false;

        return true;
    };

    try {
        console.log('[notion-block-image] Resolving block:', blockId);

        // 1차 — 공식 API. 서명 없는 S3 이미지 블록(502 원인)을 fresh signed URL로 해결한다.
        try {
            const officialBlock = await notion.blocks.retrieve({ block_id: blockId });
            if ('type' in officialBlock && officialBlock.type === 'image') {
                const image = officialBlock.image;
                const url = image.type === 'file' ? image.file.url : image.external.url;

                console.log('[notion-block-image] Using official blocks.retrieve');
                return redirectTo(url);
            }
        } catch (error) {
            // 공식 API는 북마크 커버/페이지 커버를 해결하지 못한다 — fallback으로 넘어간다.
            console.log('[notion-block-image] official API miss, falling back:', error);
        }

        // 2차 — 비공식 recordMap fallback.
        const recordMap = await getNotionPage(blockId);
        const block = recordMap.block[blockId]?.value;

        if (!block) {
            console.error('[notion-block-image] Block not found:', blockId);
            return NextResponse.json({ error: 'Block not found' }, { status: 404 });
        }

        // a) signed_urls — notion-client가 이미 서명해 둔 URL
        const signedUrl = recordMap.signed_urls?.[blockId];
        if (signedUrl) {
            console.log('[notion-block-image] Using signed_urls');
            return redirectTo(signedUrl);
        }

        // b) image 블록 — display_source 또는 properties.source가 로드 가능할 때만
        if (block.type === 'image') {
            const candidate = block.format?.display_source ?? block.properties?.source?.[0]?.[0];
            if (candidate && isLoadable(candidate)) {
                console.log('[notion-block-image] Using image block source');
                return redirectTo(candidate);
            }
        }

        // c) bookmark 블록의 커버 이미지
        if (block.type === 'bookmark' && block.format?.bookmark_cover) {
            console.log('[notion-block-image] Using bookmark_cover');
            return redirectTo(block.format.bookmark_cover);
        }

        // d) 로드 가능한 URL을 못 찾음
        console.error('[notion-block-image] Image URL not found in block:', blockId);
        return NextResponse.json({ error: 'Image URL not found' }, { status: 404 });
    } catch (error) {
        console.error('[notion-block-image] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
