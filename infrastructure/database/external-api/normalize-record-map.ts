import { ExtendedRecordMap } from 'notion-types';

const RECORD_TABLES = ['block', 'collection', 'collection_view', 'notion_user'] as const;

export function normalizeRecordMap(recordMap: ExtendedRecordMap): ExtendedRecordMap {
  for (const table of RECORD_TABLES) {
    const records = recordMap[table] as
      | Record<string, { value?: { value?: unknown; role?: string } }>
      | undefined;

    if (!records) continue;

    for (const id of Object.keys(records)) {
      const nested = records[id]?.value;

      if (nested && typeof nested === 'object' && 'value' in nested) {
        records[id] = { role: nested.role, value: nested.value } as never;
      }
    }
  }

  return recordMap;
}
