import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { ExtendedRecordMap } from 'notion-types';

// Notion recordMap 영속 캐시.
// 비공개 API(notion-client)는 미인증이라 대량/동시 호출 시 차단된다. 글당 한 번만 페치해
// 여기에 저장하고, 이후에는 DB에서 읽어 빌드/런타임 모두 Notion을 거의 건드리지 않게 한다.
// 무효화는 Notion 편집 웹훅 → revalidate API가 해당 행을 지우는 방식(+선택적 안전망 TTL).
export const notionRecordMaps = pgTable('notion_record_maps', {
  id: text('id').primaryKey(), // Notion page id
  recordMap: jsonb('record_map').$type<ExtendedRecordMap>().notNull(),
  fetchedAt: timestamp('fetched_at').defaultNow().notNull(),
});

export type NotionRecordMapSelect = typeof notionRecordMaps.$inferSelect;
export type NotionRecordMapInsert = typeof notionRecordMaps.$inferInsert;
