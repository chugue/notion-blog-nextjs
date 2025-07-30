import * as postUtils from '@/domain/utils/post.utils';
import { NotionPost } from '@/domain/entities/notion.entity';
import { PostMetadata } from '@/domain/entities/blog.entity';

const mockNotionPost: NotionPost = {
  id: '1',
  properties: {
    title: { title: [{ plain_text: 'Test Post' }] },
    author: { rich_text: [{ plain_text: 'Test Author' }] },
    date: { date: { start: '2024-01-01' } },
    tag: { multi_select: [{ name: 'React' }, { name: 'TypeScript' }] },
  },
};

const mockPostMetadata: PostMetadata[] = [
    { id: '1', title: 'Post A', author: 'Author A', date: '2024-01-02', tag: ['React'] },
    { id: '2', title: 'Post B', author: 'Author B', date: '2024-01-01', tag: ['Next.js'] },
    { id: '3', title: 'Post C', author: 'Author C', date: '2024-01-03', tag: ['React', 'TypeScript'] },
];


describe('Domain Utils - Post Utils', () => {
  describe('toPost', () => {
    it('NotionPost를 Post 형식으로 변환해야 한다', () => {
      const post = postUtils.toPost(mockNotionPost);
      expect(post).toEqual({
        metadata: {
          id: '1',
          title: 'Test Post',
          author: 'Test Author',
          date: '2024-01-01',
          tag: ['React', 'TypeScript'],
        },
        content: '',
      });
    });
  });

  describe('toPostMetadata', () => {
    it('NotionPost를 PostMetadata 형식으로 변환해야 한다', () => {
      const metadata = postUtils.toPostMetadata(mockNotionPost);
      expect(metadata).toEqual({
        id: '1',
        title: 'Test Post',
        author: 'Test Author',
        date: '2024-01-01',
        tag: ['React', 'TypeScript'],
      });
    });
  });

  describe('sortByDate', () => {
    it('PostMetadata 배열을 날짜 내림차순으로 정렬해야 한다', () => {
        const sortedPosts = postUtils.sortByDate(mockPostMetadata);
        expect(sortedPosts.map(p => p.id)).toEqual(['3', '1', '2']);
    });
  });

  describe('filterByTag', () => {
    it('"all" 태그가 주어지면 모든 포스트를 반환해야 한다', () => {
        const filteredPosts = postUtils.filterByTag(mockPostMetadata, 'all');
        expect(filteredPosts).toHaveLength(3);
    });

    it('특정 태그가 주어지면 해당 태그를 포함하는 포스트만 반환해야 한다', () => {
        const filteredPosts = postUtils.filterByTag(mockPostMetadata, 'React');
        expect(filteredPosts).toHaveLength(2);
        expect(filteredPosts.every(p => p.tag.includes('React'))).toBe(true);
    });
  });

  describe('filterBySearch', () => {
    it('빈 검색어가 주어지면 모든 포스트를 반환해야 한다', () => {
        const filteredPosts = postUtils.filterBySearch(mockPostMetadata, '');
        expect(filteredPosts).toHaveLength(3);
    });

    it('검색어가 주어지면 제목에 해당 검색어를 포함하는 포스트만 반환해야 한다', () => {
        const filteredPosts = postUtils.filterBySearch(mockPostMetadata, 'Post A');
        expect(filteredPosts).toHaveLength(1);
        expect(filteredPosts[0].title).toBe('Post A');
    });

    it('검색어는 대소문자를 구분하지 않아야 한다', () => {
        const filteredPosts = postUtils.filterBySearch(mockPostMetadata, 'post a');
        expect(filteredPosts).toHaveLength(1);
        expect(filteredPosts[0].title).toBe('Post A');
    });
  });
});