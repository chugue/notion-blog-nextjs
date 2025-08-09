import { PostMetadataResp } from '@/domain/entities/post.entity';
import { diContainer } from '@/shared/di/di-container';
import { Result } from '@/shared/types/result';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse<Result<PostMetadataResp>>> {
  const postUseCase = diContainer.post.postUseCase;
  const searchParams = request.nextUrl.searchParams;

  const result = await postUseCase.getPostsWithParams({
    tag: searchParams.get('tag') || undefined,
    sort: searchParams.get('sort') || undefined,
    pageSize: Number(searchParams.get('pageSize')) || undefined,
    startCursor: searchParams.get('startCursor') || undefined,
  });

  if (!result) {
    return NextResponse.json({
      success: false,
      error: new Error('Failed to get published posts'),
    });
  }

  return NextResponse.json({
    success: true,
    data: result,
  });
}
