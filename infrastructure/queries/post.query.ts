import { GetPublishedPostParams } from '@/domain/entities/post.entity';
import { Result } from '@/shared/types/result';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { unstable_cache } from 'next/cache';
import * as notionType from 'notion-types';
import { normalizeRecordMap } from '../database/external-api/normalize-record-map';
import { getNotionPageWithRetry, notion } from '../database/external-api/notion-client';
import notionRecordMapQuery from './notion-record-map.query';

// 같은 글에 대한 동시 캐시 미스가 Notion을 동시에 때리지 않도록(thundering herd 방지)
// 진행 중인 페치를 id별로 1건으로 합친다(single-flight).
const inFlightFetches = new Map<string, Promise<notionType.ExtendedRecordMap>>();

const fetchAndCacheRecordMap = (id: string): Promise<notionType.ExtendedRecordMap> => {
  const existing = inFlightFetches.get(id);
  if (existing) return existing;

  const pending = (async () => {
    const recordMap = (await getNotionPageWithRetry(id)) as unknown as notionType.ExtendedRecordMap;
    await notionRecordMapQuery.upsert(id, recordMap);
    return recordMap;
  })().finally(() => inFlightFetches.delete(id));

  inFlightFetches.set(id, pending);
  return pending;
};

// DB 영속 캐시 read-through: 있으면 DB에서, 없으면 single-flight로 Notion 페치 후 저장.
const getRecordMapThroughCache = async (id: string): Promise<notionType.ExtendedRecordMap> => {
  const cached = await notionRecordMapQuery.get(id);
  if (cached) return cached;

  return fetchAndCacheRecordMap(id);
};

export const postQuery = {
  getPublishedPosts: async ({
    tag = '전체',
    sort = 'latest',
    pageSize = 10,
    startCursor = undefined,
  }: GetPublishedPostParams): Promise<QueryDatabaseResponse> => {
    return await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        and: [
          {
            property: 'isPublic',
            select: {
              equals: 'Public',
            },
          },
          ...(tag && tag !== '전체'
            ? [
                {
                  property: 'tag',
                  multi_select: {
                    contains: tag,
                  },
                },
              ]
            : []),
        ],
      },
      sorts: [
        {
          property: 'createdAt',
          direction: sort === 'latest' ? 'descending' : 'ascending',
        },
      ],
      page_size: pageSize,
      start_cursor: startCursor,
    });
  },

  getPostByIdQuery: async (id: string): Promise<Result<notionType.ExtendedRecordMap>> => {
    try {
      // DB 영속 캐시 우선 → 미스만 Notion 페치(글당 1회). 일시적 페치 실패는 throw 되어
      // 상위에서 ISR 재시도로 처리되고, 영구 404로 굳지 않는다.
      const recordMap = await getRecordMapThroughCache(id);

      return {
        success: true,
        data: normalizeRecordMap(recordMap),
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error: error as Error,
      };
    }
  },

  getAllPostMetadataCache: async (): Promise<QueryDatabaseResponse> => {
    const cachedFn = unstable_cache(
      async () => {
        // 최초 요청
        let allResults: QueryDatabaseResponse['results'] = [];
        let startCursor: string | undefined = undefined;
        let hasMore = true;

        while (hasMore) {
          const res = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID!,
            filter: {
              and: [{ property: 'isPublic', select: { equals: 'Public' } }],
            },
            start_cursor: startCursor,
          });

          allResults = [...allResults, ...(res.results || [])];
          hasMore = !!res.has_more;
          startCursor = res.next_cursor || undefined;
        }

        return { results: allResults } as QueryDatabaseResponse;
      },
      ['allPostMetadatas'],
      { tags: ['allPostMetadatas'] }
    );

    return await cachedFn();
  },
};
