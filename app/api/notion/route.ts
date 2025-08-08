import { PostMetadata, PostMetadataResp } from '@/domain/entities/post.entity';
import { diContainer } from '@/shared/di/di-container';
import { Result } from '@/shared/types/result';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse<Result<PostMetadata[]>>> {
  const postUseCase = diContainer.post.postUseCase;

  const result = await postUseCase.getAllPublishedPostMetadatas();

  if (!result)
    return NextResponse.json({ success: false, error: new Error('Failed to get posts') });

  return NextResponse.json({
    success: true,
    data: result,
  });
}
