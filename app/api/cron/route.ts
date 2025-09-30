import { getDiContainer } from '@/shared/di/di-container';
import { NextResponse } from 'next/server';

export async function GET() {
  const batchUseCase = getDiContainer().batch.batchUsecase;
  const result = await batchUseCase.createTodayMetrics();

  if (!result.success) {
    console.error('Failed to create midnight metric', result.error);
    return NextResponse.json({ ok: false, error: result.error });
  }
  return NextResponse.json({ ok: true });
}
