import { diContainer } from '@/shared/di/di-container';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. 저장된 검증 토큰 가져오기
  const verificationToken = process.env.NOTION_WEBHOOK_SECERT_TOKEN;

  if (!verificationToken) {
    console.error('Verification token is missing');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // 2. 노션 시그니처 가져오기
  const body = await request.json();
  const signature = `sha256=${createHmac('sha256', verificationToken).update(JSON.stringify(body)).digest('hex')}`;
  const notionSignature = request.headers.get('X-Notion-Signature');

  // 3. 노션 시그니처 검증
  const isTrustedPayload =
    signature && timingSafeEqual(Buffer.from(signature), Buffer.from(notionSignature || ''));

  if (!isTrustedPayload) {
    console.warn('Invalid signature - ignoring request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 4. 태그 카운트 업데이트
  const result = await diContainer.tagInfo.tagInfoUseCase.updateAllTagCount();

  if (!result.success) {
    console.error(result.error);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
