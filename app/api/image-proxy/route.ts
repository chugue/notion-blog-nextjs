import { Result } from '@/shared/types/result';
import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';

// 항상 차단할 위험 도메인/IP (환경 무관)
const ALWAYS_BLOCKED = [
  '169.254.169.254', // AWS 메타데이터 (절대 허용 안됨)
];

// 프로덕션에서만 차단할 내부 도메인/IP
const PRODUCTION_BLOCKED = ['localhost', '127.0.0.1', '0.0.0.0'];

async function isDomainSafe(hostname: string): Promise<boolean> {
  // 1. 항상 차단되는 도메인 체크
  for (const blocked of ALWAYS_BLOCKED) {
    if (hostname.includes(blocked)) {
      console.warn(`Always blocked domain: ${hostname}`);
      return false;
    }
  }

  // 2. 프로덕션 환경에서만 내부 도메인 차단
  if (!isDevelopment) {
    for (const blocked of PRODUCTION_BLOCKED) {
      if (hostname.includes(blocked)) {
        console.warn(`Production blocked domain: ${hostname}`);
        return false;
      }
    }

    // 내부 IP 대역 차단 (프로덕션에서만)
    if (hostname.match(/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/)) {
      console.warn(`Production blocked internal IP: ${hostname}`);
      return false;
    }
  } else {
    // 개발 환경에서는 로그만 남기기
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      console.log(`🔧 Development: Allowing local domain: ${hostname}`);
    }
  }

  return true;
}

export async function GET(request: NextRequest): Promise<NextResponse<Result<ArrayBuffer>>> {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  try {
    const urlObj = new URL(imageUrl);

    // 환경별 도메인 안전성 검증
    const isSafe = await isDomainSafe(urlObj.hostname);

    if (!isSafe) {
      return new NextResponse('Domain not allowed', { status: 403 });
    }

    // 이미지 fetch (개발 환경에서는 더 관대한 설정)
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(isDevelopment ? 30000 : 10000), // 개발: 30초, 프로덕션: 10초
      cache: 'force-cache',
      next: {
        tags: ['image-proxy'],
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400', // 24시간
        'Content-Length': imageBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
