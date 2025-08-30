import { getDiContainer } from '@/shared/di/di-container';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const pageViewUseCase = getDiContainer().pageView.pageViewUseCase;
  await pageViewUseCase.addDetailPageView(headers(), id);

  return NextResponse.json({ success: true });
};
