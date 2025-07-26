import path from 'path';
import { TagResponse } from '../types/tag';
import fs from 'fs/promises';
import { TagFilterItem } from '../types/blog';
import { getPublishedPosts } from './notion';
import { saveTagInfo } from '../utils/save-tag-info';

export const TAGS_FILE_PATH = path.join(process.cwd(), 'lib/data/tags.json');

// 태그 파일에서 정보 가져오기
export const getTagsFromFile = async (): Promise<TagResponse> => {
  try {
    const fileContent = await fs.readFile(TAGS_FILE_PATH, 'utf-8');
    const tags = JSON.parse(fileContent) as TagResponse;

    return tags;
  } catch (error) {
    console.log(error);
    return {
      tags: [
        {
          id: 'all',
          name: '전체',
          count: 0,
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }
};

// 태그 업데이트
export const updateTags = async (): Promise<TagFilterItem[]> => {
  const result = await getPublishedPosts({});

  if (!result.success) return [];

  const { posts } = result.data;

  // 태그 개수 계산
  const tagCount = posts.reduce(
    (acc, post) => {
      post.language?.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // TagFilterItem 형식으로 변환
  const tags: TagFilterItem[] = Object.entries(tagCount).map(([name, count]) => ({
    id: name,
    name,
    count,
  }));

  // "전체" 태그 추가
  tags.unshift({
    id: 'all',
    name: '전체',
    count: posts.length,
  });

  // 태그 이름 기준으로 정렬 ("전체" 태그는 항상 첫 번째에 위치)
  const [allTag, ...restTags] = tags;
  const sortedTags = restTags.sort((a, b) => a.name.localeCompare(b.name));
  const finalTags = [allTag, ...sortedTags];

  await saveTagInfo(finalTags);

  return finalTags;
};

// 태그 파일이 존재하는지 확인
export const checkTagsFileExists = async (): Promise<boolean> => {
  try {
    await fs.access(TAGS_FILE_PATH);
    return true;
  } catch {
    return false;
  }
};
