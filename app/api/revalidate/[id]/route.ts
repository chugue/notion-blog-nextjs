import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  revalidateTag(`post-${id}`, { expire: 0 });

  return NextResponse.json({ success: true });
};
