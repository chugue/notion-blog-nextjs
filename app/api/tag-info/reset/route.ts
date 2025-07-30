import { NextRequest, NextResponse } from 'next/server';
import { diContainer } from '@/shared/di/di-container';
import { Result } from '@/shared/types/result';
import { TagFilterItem } from '@/domain/entities/blog.entity';
import { toTagFilterItem } from '@/domain/utils/tag-into.utils';

export const POST = async (
  _request: NextRequest
): Promise<NextResponse<Result<TagFilterItem[]>>> => {
  const tagInfoUseCase = diContainer.tagInfo.tagInfoUseCase;
  const postUseCase = diContainer.post.postUseCase;

  // 1. 모든 포스트 조회
  const postMetadatas = await postUseCase.getAllPublishedPostMetadatas();

  if (postMetadatas.length === 0) {
    return NextResponse.json({
      success: false,
      error: new Error('No posts found'),
    });
  }

  // 2. 포스트 데이터에서 태그 추출 후 TagInfoInsert로 가공
  const tagFilterItems = toTagFilterItem(postMetadatas);

  // 3. TagInfoInsert 데이터를 데이터베이스에 저장
  const result = await tagInfoUseCase.resetTagInfoList(tagFilterItems);

  console.log('result', result);

  return NextResponse.json({
    success: true,
    data: result,
  });
};
