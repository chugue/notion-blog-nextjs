import { getPublishedPosts } from '@/lib/services/notion';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const response = await getPublishedPosts({
    tag: searchParams.get('tag') || undefined,
    sort: searchParams.get('sort') || undefined,
    pageSize: Number(searchParams.get('pageSize')) || undefined,
    startCursor: searchParams.get('startCursor') || undefined,
  });

  return NextResponse.json(response);
}
