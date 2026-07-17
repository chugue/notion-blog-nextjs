import notionRecordMapQuery from '@/infrastructure/queries/notion-record-map.query';
import { diContainer } from '@/shared/di/di-container';
import {
    extractEventType,
    extractPageId,
    parseNotionWebhookRequest,
    toDashedId,
} from '@/shared/utils/notion-webhook.utils';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// 노션 웹훅 단일 수신 엔드포인트.
// 노션 구독은 통합당 하나(URL·토큰 1개)만 걸 수 있어서 모든 이벤트를 여기서 받고,
// 이벤트 타입으로 분기한다:
// - 페이지 id가 있는 모든 이벤트 → 해당 글의 recordMap 캐시 무효화
// - 메타데이터 이벤트(생성/삭제/속성 변경) → 사이드바 태그 카운트 + 목록 캐시 갱신

// 태그 카운트·목록에 영향을 주는 이벤트들 (본문만 고친 content_updated는 제외)
const METADATA_EVENTS = [
    'page.created',
    'page.deleted',
    'page.undeleted',
    'page.moved',
    'page.properties_updated',
];

export async function POST(request: NextRequest) {
    const secret = process.env.NOTION_WEBHOOK_SECERT_TOKEN;

    if (!secret) {
        console.error('[notion-webhook] verification token is missing');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const webhook = await parseNotionWebhookRequest(request, secret);

    if (webhook.kind === 'handshake') {
        console.log('[notion-webhook] verification_token:', webhook.verificationToken);
        return NextResponse.json({ verification_token: webhook.verificationToken });
    }

    if (webhook.kind === 'invalid') {
        console.warn('[notion-webhook] invalid signature - ignoring request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 분기 플래그 — 타입을 알 수 없는 페이로드는 양쪽 다 수행해서 안전하게 처리
    const eventType = extractEventType(webhook.payload);
    const pageId = extractPageId(webhook.payload);
    const shouldPurgePost = !!pageId;
    const shouldRefreshMetadata = !eventType || METADATA_EVENTS.includes(eventType);

    if (pageId) {
        await purgePostCache(toDashedId(pageId));
    }

    if (shouldRefreshMetadata) {
        const result = await refreshTagCountAndLists();

        if (!result.success) {
            console.error('[notion-webhook] tag count update failed:', result.error);
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }
    }

    return NextResponse.json({
        success: true,
        event: eventType ?? 'unknown',
        purgedPost: shouldPurgePost,
        refreshedMetadata: shouldRefreshMetadata,
    });
}

// 편집된 글의 stale 캐시 무효화 — DB row 삭제 + 렌더된 페이지 재검증.
// 다음 요청에서 read-through 캐시가 미스를 감지해 노션 최신본을 재페치·재저장한다.
const purgePostCache = async (pageId: string): Promise<void> => {
    await notionRecordMapQuery.delete(pageId);
    revalidateTag(`post-${pageId}`, { expire: 0 });
    revalidatePath(`/blog/${pageId}`);
};

// 사이드바 태그 카운트 재집계(Supabase tag_info 교체) + 목록 캐시 무효화.
// 새 글 발행·제목/태그 변경이 메인 페이지와 검색 목록에 바로 반영되게 한다.
const refreshTagCountAndLists = async () => {
    const result = await diContainer.tagInfo.tagInfoUseCase.updateAllTagCount();

    revalidateTag('getMainPageDataCache', { expire: 0 });
    revalidateTag('getAllPublishedPostMetadatas', { expire: 0 });
    revalidateTag('allPostMetadatas', { expire: 0 });

    return result;
};
