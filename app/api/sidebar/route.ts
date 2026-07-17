import notionRecordMapQuery from '@/infrastructure/queries/notion-record-map.query';
import { diContainer } from '@/shared/di/di-container';
import { createHmac, timingSafeEqual } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// 노션 웹훅 페이로드에서 편집된 페이지 id 추출 (이벤트 포맷별 방어적 조회).
const extractPageId = (payload: unknown): string | undefined => {
  const p = payload as Record<string, any>;
  const raw = p?.entity?.id ?? p?.data?.id ?? p?.page?.id ?? p?.page_id;
  return typeof raw === 'string' ? raw : undefined;
};

// 노션 id는 대시 없는 32자리로 올 수 있는데, 캐시 키(DB row)는 대시 형식이라 맞춰준다.
const toDashedId = (raw: string): string => {
  const hex = raw.replace(/-/g, '');
  if (hex.length !== 32) return raw;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export async function POST(request: NextRequest) {
  // 1. 저장된 검증 토큰 가져오기
  const verificationToken = process.env.NOTION_WEBHOOK_SECERT_TOKEN;

  if (!verificationToken) {
    console.error('Verification token is missing');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // 2. 원본(raw) 바디로 검증한다 — JSON.stringify(parsed)는 노션이 서명한 바이트와
  //    달라질 수 있어(키 순서/공백/유니코드) 시그니처가 안 맞는다.
  const rawBody = await request.text();

  let payload: unknown = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    // 파싱 실패는 아래에서 빈 페이로드로 처리
  }

  // 3. 구독 최초 등록 시 노션이 보내는 검증 핸드셰이크(서명 없음): 토큰을 그대로 echo.
  const verificationChallenge = (payload as Record<string, any>)?.verification_token;
  if (verificationChallenge) {
    console.log('[notion-webhook] verification_token:', verificationChallenge);
    return NextResponse.json({ verification_token: verificationChallenge });
  }

  // 4. 시그니처 검증 (길이 가드 후 timingSafeEqual — 길이 다르면 throw 하므로)
  const expected = `sha256=${createHmac('sha256', verificationToken).update(rawBody).digest('hex')}`;
  const received = request.headers.get('X-Notion-Signature') ?? '';
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(received);
  const isTrustedPayload =
    expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf);

  if (!isTrustedPayload) {
    console.warn('Invalid signature - ignoring request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 5. 편집된 글의 stale 캐시 무효화 — DB row 삭제 + 렌더된 페이지 재검증.
  //    다음 요청에서 캐시 미스 → Notion 최신본 재페치 후 재저장된다.
  const rawId = extractPageId(payload);
  if (rawId) {
    const pageId = toDashedId(rawId);
    await notionRecordMapQuery.delete(pageId);
    revalidateTag(`post-${pageId}`, { expire: 0 });
    revalidatePath(`/blog/${pageId}`);
  }

  // 6. 사이드바 태그 카운트 업데이트 (기존 로직)
  const result = await diContainer.tagInfo.tagInfoUseCase.updateAllTagCount();

  if (!result.success) {
    console.error(result.error);
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
