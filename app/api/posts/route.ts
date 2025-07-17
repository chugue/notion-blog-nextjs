import { getPublishedPost } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = await getPublishedPost();
  return NextResponse.json(posts);
}
