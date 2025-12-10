import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = async () => {
  revalidateTag('getAllPublishedPostMetadatas', { expire: 0 });
  revalidateTag('all-searchable-posts', { expire: 0 });
  revalidateTag('all-posts', { expire: 0 });
  revalidateTag('image-proxy', { expire: 0 });
  revalidateTag('mainPageDefault', { expire: 0 });
  revalidateTag('allPostMetadatas', { expire: 0 });
  revalidateTag('getMainPageDataCache', { expire: 0 });

  return NextResponse.json({ success: true });
};
