import notionRecordMapQuery from '@/infrastructure/queries/notion-record-map.query';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

// Notion 편집 웹훅이 호출하는 무효화 엔드포인트.
// 영속 캐시 행을 지우면 다음 요청이 최신 recordMap을 Notion에서 다시 페치해 저장한다.
export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  await notionRecordMapQuery.delete(id);
  revalidateTag(`post-${id}`, { expire: 0 });

  return NextResponse.json({ success: true });
};
