import { notion } from '@/infrastructure/database/external-api/notion-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const blockId = request.nextUrl.searchParams.get('blockId');

    if (!blockId) {
        return NextResponse.json({ error: 'blockId is required' }, { status: 400 });
    }

    try {
        // Notion API로 블록 정보 가져오기
        const block = await notion.blocks.retrieve({ block_id: blockId });

        // 이미지 URL 추출
        let imageUrl: string | null = null;

        if ('type' in block && block.type === 'image') {
            const imageBlock = block.image;
            if (imageBlock.type === 'file') {
                imageUrl = imageBlock.file.url;
            } else if (imageBlock.type === 'external') {
                imageUrl = imageBlock.external.url;
            }
        }

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // 이미지 fetch 및 스트리밍
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
        }

        const contentType = imageResponse.headers.get('Content-Type') || 'image/png';

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
