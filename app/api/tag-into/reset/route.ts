import { NextRequest, NextResponse } from 'next/server';
import { diContainer } from '@/shared/di/di-container';

export const GET = async (_request: NextRequest) => {
  const tagInfoUseCase = diContainer.tagInfo.tagInfoUseCase;

  const result = await tagInfoUseCase.resetTagInfo();

  return NextResponse.json({ message: 'Hello, world!' });
};
