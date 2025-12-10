import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const encodedUrl = request.nextUrl.searchParams.get('url');

    if (!encodedUrl) {
        return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    try {
        const imageUrl = decodeURIComponent(encodedUrl);

        // 이미지 fetch (referrer 없이)
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NotionImageProxy/1.0)',
            },
        });

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
