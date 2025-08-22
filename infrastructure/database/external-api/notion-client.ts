import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { NotionAPI } from 'notion-client';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2022-06-28',
});

export const notionAPI = new NotionAPI({
  authToken: process.env.NOTION_TOKEN!,
});

export const n2m = new NotionToMarkdown({ notionClient: notion });
