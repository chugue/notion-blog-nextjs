import { toTagFilterItem } from '@/domain/utils/tag-info.utils';
import { PostMetadata, TagFilterItem } from '@/domain/entities/post.entity';

describe('Domain Utils - Tag Utils', () => {
  describe('toTagFilterItem', () => {
    it('빈 배열이 주어졌을 때 "전체" 태그만 반환해야 한다', () => {
      // Given
      const posts: PostMetadata[] = [];

      // When
      const result = toTagFilterItem(posts);

      // Then
      expect(result).toEqual([
        {
          id: 'all',
          name: '전체',
          count: 0,
        },
      ]);
    });

    it('포스트 배열이 주어졌을 때 태그별 개수를 계산해야 한다', () => {
      // Given
      const posts: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post 1',
          author: 'Author 1',
          date: '2024-01-01',
          tag: ['React', 'TypeScript'],
        },
        {
          id: '2',
          title: 'Test Post 2',
          author: 'Author 2',
          date: '2024-01-02',
          tag: ['React', 'Next.js'],
        },
        {
          id: '3',
          title: 'Test Post 3',
          author: 'Author 3',
          date: '2024-01-03',
          tag: ['TypeScript'],
        },
      ];

      // When
      const result = toTagFilterItem(posts);

      // Then
      expect(result).toHaveLength(4); // 전체 + 3개 태그
      expect(result[0]).toEqual({
        id: 'all',
        name: '전체',
        count: 3,
      });

      // 태그들이 알파벳 순으로 정렬되어야 함
      const tagNames = result.slice(1).map((tag) => tag.name);
      expect(tagNames).toEqual(['Next.js', 'React', 'TypeScript']);

      // 각 태그의 개수가 정확해야 함
      const reactTag = result.find((tag) => tag.name === 'React');
      const typeScriptTag = result.find((tag) => tag.name === 'TypeScript');
      const nextjsTag = result.find((tag) => tag.name === 'Next.js');

      expect(reactTag?.count).toBe(2);
      expect(typeScriptTag?.count).toBe(2);
      expect(nextjsTag?.count).toBe(1);
    });

    it('중복된 태그가 있을 때 올바르게 카운트해야 한다', () => {
      // Given
      const posts: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post 1',
          author: 'Author 1',
          date: '2024-01-01',
          tag: ['React', 'React'], // 중복 태그
        },
      ];

      // When
      const result = toTagFilterItem(posts);

      // Then
      const reactTag = result.find((tag) => tag.name === 'React');
      expect(reactTag?.count).toBe(2); // 중복된 태그도 각각 카운트
    });

    it('태그가 없는 포스트가 포함되어도 정상 작동해야 한다', () => {
      // Given
      const posts: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post 1',
          author: 'Author 1',
          date: '2024-01-01',
          tag: [],
        },
        {
          id: '2',
          title: 'Test Post 2',
          author: 'Author 2',
          date: '2024-01-02',
          tag: ['React'],
        },
      ];

      // When
      const result = toTagFilterItem(posts);

      // Then
      expect(result).toHaveLength(2); // 전체 + React
      expect(result[0].count).toBe(2); // 전체 포스트 수
      expect(result[1].name).toBe('React');
      expect(result[1].count).toBe(1);
    });
  });
});
