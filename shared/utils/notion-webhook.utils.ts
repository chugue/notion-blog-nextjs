import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

// 노션 웹훅 수신 라우트(/api/notion/webhook)의 검증·파싱 유틸.

export type NotionWebhookRequest =
    | { kind: 'handshake'; verificationToken: string }
    | { kind: 'invalid' }
    | { kind: 'event'; payload: Record<string, unknown> };

// 요청을 검증하고 세 갈래로 분류한다:
// handshake — 구독 최초 등록 시 서명 없이 오는 verification_token 요청 (그대로 echo 해야 함)
// invalid   — 시그니처 불일치 (노션이 보낸 요청이 아님)
// event     — 검증 통과한 실제 이벤트
export const parseNotionWebhookRequest = async (
    request: NextRequest,
    secret: string
): Promise<NotionWebhookRequest> => {
    // 시그니처는 노션이 서명한 원본(raw) 바이트로 계산해야 한다 —
    // JSON.stringify(parsed)는 키 순서·공백이 달라져 검증이 깨질 수 있다.
    const rawBody = await request.text();

    let payload: Record<string, unknown> = {};
    try {
        payload = JSON.parse(rawBody);
    } catch {
        // 파싱 실패는 빈 페이로드로 두고 아래 시그니처 검증에서 걸러진다
    }

    if (typeof payload.verification_token === 'string') {
        return { kind: 'handshake', verificationToken: payload.verification_token };
    }

    const signature = request.headers.get('X-Notion-Signature') ?? '';
    if (!verifyNotionSignature(rawBody, signature, secret)) {
        return { kind: 'invalid' };
    }

    return { kind: 'event', payload };
};

const verifyNotionSignature = (rawBody: string, signature: string, secret: string): boolean => {
    const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signature);

    // timingSafeEqual은 길이가 다르면 throw 하므로 길이부터 가드한다
    return expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf);
};

// 노션 웹훅 페이로드의 이벤트 타입 (예: page.content_updated, page.properties_updated).
export const extractEventType = (payload: Record<string, unknown>): string | undefined => {
    return typeof payload.type === 'string' ? payload.type : undefined;
};

// 노션 웹훅 페이로드에서 편집된 페이지 id 추출 (이벤트 포맷별 방어적 조회).
export const extractPageId = (payload: Record<string, unknown>): string | undefined => {
    const entity = payload.entity as { id?: unknown } | undefined;
    const data = payload.data as { id?: unknown } | undefined;
    const page = payload.page as { id?: unknown } | undefined;
    const raw = entity?.id ?? data?.id ?? page?.id ?? payload.page_id;

    return typeof raw === 'string' ? raw : undefined;
};

// 노션 id는 대시 없는 32자리로 올 수 있는데, 캐시 키(DB row)는 대시 형식이라 맞춰준다.
export const toDashedId = (raw: string): string => {
    const hex = raw.replace(/-/g, '');

    if (hex.length !== 32) return raw;

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
