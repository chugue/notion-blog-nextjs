import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import { NotionToMarkdown } from 'notion-to-md';

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  notionVersion: '2022-06-28',
});

export const notionAPI = new NotionAPI();

export const n2m = new NotionToMarkdown({ notionClient: notion });
