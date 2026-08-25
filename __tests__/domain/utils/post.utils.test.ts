import { jest } from '@jest/globals';
import * as postUtils from '@/domain/utils/post.utils';
import { PostMetadata } from '@/domain/entities/post.entity';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

type TitleProperty = Extract<PageObjectResponse['properties'][string], { type: 'title' }>;

const createTitleProperty = (content: string): TitleProperty => ({
  id: 'title',
  type: 'title',
  title: [
    {
      type: 'text',
      text: { content, link: null },
      plain_text: content,
      href: null,
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default',
      },
    },
  ],
});

const mockPage: PageObjectResponse = {
  object: 'page',
  id: '1',
  created_time: '2024-01-01T00:00:00.000Z',
  last_edited_time: '2024-01-01T00:00:00.000Z',
  created_by: { object: 'user', id: 'user-1' },
  last_edited_by: { object: 'user', id: 'user-1' },
  parent: { type: 'database_id', database_id: 'db-1' },
  archived: false,
  in_trash: false,
  icon: null,
  cover: null,
  url: 'https://www.notion.so/1',
  public_url: null,
  properties: {
    title: createTitleProperty('Test Post'),
    author: {
      id: 'author',
      type: 'people',
      people: [
        {
          object: 'user',
          id: 'user-1',
          type: 'person',
          name: 'Test Author',
          avatar_url: null,
          person: {},
        },
      ],
    },
    createdAt: {
      id: 'createdAt',
      type: 'created_time',
      created_time: '2024-01-01T00:00:00.000Z',
    },
    tag: {
      id: 'tag',
      type: 'multi_select',
      multi_select: [
        { id: 't1', name: 'React', color: 'blue' },
        { id: 't2', name: 'TypeScript', color: 'green' },
      ],
    },
  },
};

const mockPostMetadata: PostMetadata[] = [
  { id: '1', title: 'Post A', author: 'Author A', date: '2024-01-02', tag: ['React'] },
  { id: '2', title: 'Post B', author: 'Author B', date: '2024-01-01', tag: ['Next.js'] },
  {
    id: '3',
    title: 'Post C',
    author: 'Author C',
    date: '2024-01-03',
    tag: ['React', 'TypeScript'],
  },
];

describe('Domain Utils - Post Utils', () => {
  describe('getPostMetadata', () => {
    it('PageObjectResponse를 PostMetadata 형식으로 변환해야 한다', () => {
      const metadata = postUtils.getPostMetadata(mockPage);
      expect(metadata).toEqual({
        id: '1',
        title: 'Test Post',
        author: 'Test Author',
        date: '2024-01-01T00:00:00.000Z',
        tag: ['React', 'TypeScript'],
        coverImage: '',
      });
    });

    it('커버 이미지의 S3 URL을 Notion 영구 URL로 변환해야 한다', () => {
      const pageWithCover: PageObjectResponse = {
        ...mockPage,
        cover: {
          type: 'file',
          file: {
            url: 'https://prod-files-secure.s3.us-west-2.amazonaws.com/space-1/file-1/cover.png?X-Amz-Signature=abc',
            expiry_time: '2024-01-02T00:00:00.000Z',
          },
        },
      };

      const metadata = postUtils.getPostMetadata(pageWithCover);
      expect(metadata.coverImage).toBe(
        'https://www.notion.so/image/attachment%3Afile-1%3Acover.png?table=block&id=1&spaceId=space-1'
      );
    });
  });

  describe('convertS3UrlToNotionUrl', () => {
    it('유효하지 않은 URL이 주어지면 null을 반환해야 한다', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(postUtils.convertS3UrlToNotionUrl('not a url', '1')).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('sortByDate', () => {
    it('PostMetadata 배열을 날짜 내림차순으로 정렬해야 한다', () => {
      const sortedPosts = postUtils.sortByDate(mockPostMetadata);
      expect(sortedPosts.map((p) => p.id)).toEqual(['3', '1', '2']);
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
      expect(filteredPosts.every((p) => p.tag.includes('React'))).toBe(true);
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
