import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = async () => {
  revalidateTag('getAllPublishedPostMetadatas');
  revalidateTag('all-searchable-posts');
  revalidateTag('all-posts');
  revalidateTag('image-proxy');
  revalidateTag('mainPageDefault');

  return NextResponse.json({ success: true });
};
