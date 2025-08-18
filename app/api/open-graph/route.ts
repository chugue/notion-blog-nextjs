import { Result } from '@/shared/types/result';
import { NextRequest, NextResponse } from 'next/server';
import ogs from 'open-graph-scraper';
import type { OgObject } from 'open-graph-scraper/types';

export const GET = async (request: NextRequest): Promise<NextResponse<Result<OgObject>>> => {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { success: false, error: new Error('URL is required') },
      { status: 400 }
    );
  }

  const isImageUrl =
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.includes('notion.so/image/');

  if (isImageUrl) {
    return NextResponse.json(
      { success: true, data: { message: '이미지 URL입니다.' } as OgObject },
      { status: 200 }
    );
  }

  try {
    const { result } = await ogs({
      url,
      timeout: 5000,
      onlyGetOpenGraphInfo: false, // fallback 허용
      fetchOptions: {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        },
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: new Error('Failed to scrape Open Graph data') },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Open Graph scraping error:', error);
    return NextResponse.json(
      { success: false, error: new Error('Internal server error') },
      { status: 500 }
    );
  }
};
