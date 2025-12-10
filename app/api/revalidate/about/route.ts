import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = async (_request: Request) => {
  revalidateTag(`about-page`, { expire: 0 });
  revalidatePath('/about');

  return NextResponse.json({ success: true });
};
