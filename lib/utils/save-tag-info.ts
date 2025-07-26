import path from 'path';
import { TAGS_FILE_PATH } from '../services/tag';
import fs from 'fs/promises';
import { Tag, TagResponse } from '../types/tag';

export async function saveTagInfo(tags: Tag[]) {
  try {
    const dataDir = path.dirname(TAGS_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    const tagData: TagResponse = {
      tags,
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeFile(TAGS_FILE_PATH, JSON.stringify(tagData, null, 2), 'utf-8');
    console.log('태그 파일 업데이트 완료');
  } catch (error) {
    console.log(error);
    throw new Error('태그 파일 업데이트 실패');
  }
}
