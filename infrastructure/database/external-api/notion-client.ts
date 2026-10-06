import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';
import { getPageContentBlockIds } from 'notion-utils';
import { NotionToMarkdown } from 'notion-to-md';

import { normalizeRecordMap } from './normalize-record-map';

export const notion = new Client({
    auth: process.env.NOTION_TOKEN,
    notionVersion: '2022-06-28',
});

// Notion 비공개 API 앞의 Cloudflare는 Node 기본 UA("node") 요청을 403 HTML로 차단한다.
// 캐시 미스 글(신규 발행)은 이 경로로만 페치되므로 식별 가능한 UA를 명시해 차단을 피한다.
const NOTION_PRIVATE_API_USER_AGENT =
    process.env.NOTION_PRIVATE_API_USER_AGENT ??
    'Mozilla/5.0 (compatible; stephen-dev-blog/1.0; +https://www.stephen-dev.blog)';

export const notionAPI = new NotionAPI({
    kyOptions: { headers: { 'user-agent': NOTION_PRIVATE_API_USER_AGENT } },
});

export const n2m = new NotionToMarkdown({ notionClient: notion });

// 비공개 API(notion-client)는 미인증 호출이라, 대량 SSG 빌드에서 동시 요청이 몰리면
// Notion이 JSON 대신 HTML 차단 페이지(<!doctype ...>)를 돌려주고 getPage가 깨진다.
// 그러면 getPostById가 null → notFound()가 되어 정상 글이 영구 404로 구워진다.
// 방어: (1) 프로세스당 동시 호출 수를 제한하고 호출 간격을 띄워 차단을 피하고,
//       (2) 그래도 실패하면 지수 백오프로 재시도한다.
const NOTION_PAGE_MAX_CONCURRENCY = Number(process.env.NOTION_PAGE_CONCURRENCY ?? 2);
const NOTION_PAGE_MIN_SPACING_MS = Number(process.env.NOTION_PAGE_SPACING_MS ?? 120);
const NOTION_PAGE_MAX_RETRIES = Number(process.env.NOTION_PAGE_RETRIES ?? 3);
const NOTION_PAGE_BASE_DELAY_MS = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isHtmlBlockError = (error: unknown): boolean => {
    const message = (error as Error)?.message ?? '';

    return (
        message.includes('not valid JSON') ||
        message.includes('<!doctype') ||
        message.includes('<html')
    );
};

// 프로세스 단위 동시성 게이트: 진행 중 호출 수를 한도 아래로 유지한다.
let activeCalls = 0;
const waiters: Array<() => void> = [];
let lastDispatchAt = 0;

const acquireSlot = async (): Promise<void> => {
    if (activeCalls >= NOTION_PAGE_MAX_CONCURRENCY) {
        await new Promise<void>((resolve) => waiters.push(resolve));
    }
    activeCalls++;

    const sinceLast = Date.now() - lastDispatchAt;
    if (sinceLast < NOTION_PAGE_MIN_SPACING_MS) {
        await wait(NOTION_PAGE_MIN_SPACING_MS - sinceLast);
    }
    lastDispatchAt = Date.now();
};

const releaseSlot = (): void => {
    activeCalls--;
    waiters.shift()?.();
};

// getPage는 첫 청크(100블록)만 받고 나머지는 fetchMissingBlocks로 채우는데, 비공개 API가
// 블록을 { value: { value, role } } 로 중첩해 내려주면서 notion-utils가 content를 못 읽어
// 그 단계가 조용히 건너뛰어진다 → 100블록 넘는 글의 뒷부분이 통째로 빠진다.
// 정규화된 recordMap 기준으로 누락 블록을 직접 채운다.
const MAX_MISSING_BLOCK_ROUNDS = 10;

const fillMissingBlocks = async (
    recordMap: ExtendedRecordMap,
    rootId: string
): Promise<ExtendedRecordMap> => {
    for (let round = 0; round < MAX_MISSING_BLOCK_ROUNDS; round++) {
        const missingIds = getPageContentBlockIds(recordMap, rootId).filter(
            (blockId) => !recordMap.block[blockId]
        );
        if (missingIds.length === 0) break;

        const response = await notionAPI.getBlocks(missingIds);
        const fetched = normalizeRecordMap(response.recordMap as ExtendedRecordMap).block ?? {};
        if (Object.keys(fetched).length === 0) break;

        recordMap.block = { ...recordMap.block, ...fetched };
    }

    return recordMap;
};

export async function getNotionPageWithRetry(id: string): Promise<ExtendedRecordMap> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= NOTION_PAGE_MAX_RETRIES; attempt++) {
        await acquireSlot();
        try {
            const recordMap = await notionAPI.getPage(id);

            if (!recordMap?.block || Object.keys(recordMap.block).length === 0) {
                throw new Error(`Empty recordMap for ${id}`);
            }

            return await fillMissingBlocks(normalizeRecordMap(recordMap), id);
        } catch (error) {
            lastError = error;
        } finally {
            releaseSlot();
        }

        if (attempt === NOTION_PAGE_MAX_RETRIES) break;

        // HTML 차단 페이지는 더 길게 쉬어준다(레이트리밋 회복 대기).
        const penalty = isHtmlBlockError(lastError) ? 2 : 1;
        const backoff = NOTION_PAGE_BASE_DELAY_MS * 2 ** attempt * penalty;
        const jitter = backoff * (0.25 + (attempt % 3) * 0.25);
        await wait(backoff + jitter);
    }

    throw lastError;
}

export async function getNotionPage(id: string): Promise<ExtendedRecordMap> {
    const recordMap = await getNotionPageWithRetry(id);
    return normalizeRecordMap(recordMap);
}
