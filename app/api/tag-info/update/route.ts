import { diContainer } from '@/shared/di/di-container';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (_request: NextRequest) => {
  const tagInfoUseCase = diContainer.tagInfo.tagInfoUseCase;
};
