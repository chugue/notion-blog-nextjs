import { getDiContainer } from '@/shared/di/di-container';
import { Result } from '@/shared/types/result';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const POST = async (_req: Request): Promise<NextResponse<Result<boolean>>> => {
  const pageViewUseCase = getDiContainer().pageView.pageViewUseCase;
  await pageViewUseCase.addMainPageView(headers());

  return NextResponse.json({ success: true, data: true });
};
