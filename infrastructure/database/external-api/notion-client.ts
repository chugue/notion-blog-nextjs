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

export async function getNotionPage(id: string): Promise<ExtendedRecordMap> {
  const recordMap = await notionAPI.getPage(id);
  return normalizeRecordMap(recordMap);
}
