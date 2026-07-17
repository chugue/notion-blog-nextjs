import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import { ExtendedRecordMap } from 'notion-types';
import { NotionToMarkdown } from 'notion-to-md';

import { normalizeRecordMap } from './normalize-record-map';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2022-06-28',
});

export const notionAPI = new NotionAPI();

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
  return message.includes('not valid JSON') || message.includes('<!doctype') || message.includes('<html');
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

export async function getNotionPageWithRetry(id: string): Promise<ExtendedRecordMap> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= NOTION_PAGE_MAX_RETRIES; attempt++) {
    await acquireSlot();
    try {
      const recordMap = await notionAPI.getPage(id);

      if (!recordMap?.block || Object.keys(recordMap.block).length === 0) {
        throw new Error(`Empty recordMap for ${id}`);
      }

      return recordMap;
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
