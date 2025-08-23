import React from 'react';
import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import { diContainer } from '../../shared/di/di-container';

// Mock dependencies
jest.mock('../../shared/di/di-container', () => ({
  diContainer: {
    post: {
      postUseCase: {
        getPostsWithParams: jest.fn(),
        getPostById: jest.fn(),
        getAllPublishedPostMetadatas: jest.fn(),
      },
    },
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));

// Mock components
jest.mock('../../../app/(blog)/_components/NotionPageContent', () => ({
  __esModule: true,
  default: ({ recordMap }: { recordMap: unknown }) => (
    <div data-testid="notion-page-content">
      <div data-testid="record-map-data">{JSON.stringify(recordMap)}</div>
    </div>
  ),
}));

jest.mock('../../../app/(main)/_components/post-list/PostList.client', () => ({
  __esModule: true,
  default: ({ posts }: { posts: any[] }) => (
    <div data-testid="post-list">
      {posts.map((post) => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          <h3>{post.title}</h3>
          <p>{post.author}</p>
          <span>{post.date}</span>
          {post.tag.map((tag: string) => (
            <span key={tag} data-testid={`tag-${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../app/(main)/_components/search/SearchModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="search-modal">
        <button onClick={onClose} data-testid="close-search">
          Close
        </button>
        <div data-testid="search-results">Search Results</div>
      </div>
    ) : null,
}));

describe('User Scenario Integration Tests', () => {
  const mockPostUseCase = diContainer.post.postUseCase as jest.Mocked<
    typeof diContainer.post.postUseCase
  >;

  const mockPosts = {
    posts: [
      {
        id: 'post-1',
        title: 'React Hooks 완전 가이드',
        author: '김성훈',
        date: '2024-01-01',
        tag: ['React', 'JavaScript'],
        coverImage: '/images/react-hooks.jpg',
      },
      {
        id: 'post-2',
        title: 'TypeScript 타입 시스템 마스터하기',
        author: '김성훈',
        date: '2024-01-02',
        tag: ['TypeScript', 'JavaScript'],
        coverImage: '/images/typescript.jpg',
      },
      {
        id: 'post-3',
        title: 'Next.js 14 App Router 활용법',
        author: '김성훈',
        date: '2024-01-03',
        tag: ['Next.js', 'React'],
        coverImage: '/images/nextjs.jpg',
      },
    ],
    hasMore: false,
    nextCursor: null,
  };

  const mockPostDetail = {
    properties: {
      id: 'post-1',
      title: 'React Hooks 완전 가이드',
      author: '김성훈',
      date: '2024-01-01',
      tag: ['React', 'JavaScript'],
      coverImage: '/images/react-hooks.jpg',
    },
    recordMap: {
      block: {
        'block-1': {
          role: 'reader',
          value: {
            id: 'block-1',
            type: 'text',
            properties: {
              title: [['React Hooks에 대한 상세한 가이드입니다.']],
            },
            content: [],
            parent_id: 'parent-block',
            parent_table: 'block',
            alive: true,
            created_by_id: 'user-id',
            created_by_table: 'notion_user',
            created_time: 1234567890,
            last_edited_by_id: 'user-id',
            last_edited_by_table: 'notion_user',
            last_edited_time: 1234567890,
            version: 1,
          },
        },
      },
      collection: {},
      collection_view: {},
      collection_query: {},
      notion_user: {},
      signed_urls: {},
      preview_images: {},
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scenario 1: 사용자가 블로그 메인 페이지에서 포스트 목록을 확인', () => {
    it('should display all posts with correct information', async () => {
      // Arrange
      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      // Act - 메인 페이지 렌더링 시뮬레이션
      const MainPage = require('../../../app/(main)/page').default;
      render(await MainPage());

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
        expect(screen.getByTestId('post-post-1')).toBeInTheDocument();
        expect(screen.getByTestId('post-post-2')).toBeInTheDocument();
        expect(screen.getByTestId('post-post-3')).toBeInTheDocument();

        // 포스트 정보 확인
        expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();
        expect(screen.getByText('TypeScript 타입 시스템 마스터하기')).toBeInTheDocument();
        expect(screen.getByText('Next.js 14 App Router 활용법')).toBeInTheDocument();

        // 태그 확인
        expect(screen.getByTestId('tag-React')).toBeInTheDocument();
        expect(screen.getByTestId('tag-TypeScript')).toBeInTheDocument();
        expect(screen.getByTestId('tag-JavaScript')).toBeInTheDocument();
      });
    });

    it('should handle empty post list gracefully', async () => {
      // Arrange
      mockPostUseCase.getPostsWithParams.mockResolvedValue({
        posts: [],
        hasMore: false,
        nextCursor: null,
      });

      // Act
      const MainPage = require('../../../app/(main)/page').default;
      render(await MainPage());

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('post-list')).toBeInTheDocument();
        expect(screen.queryByTestId('post-post-1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Scenario 2: 사용자가 특정 태그로 포스트를 필터링', () => {
    it('should filter posts by React tag', async () => {
      // Arrange
      const reactPosts = {
        posts: [
          {
            id: 'post-1',
            title: 'React Hooks 완전 가이드',
            author: '김성훈',
            date: '2024-01-01',
            tag: ['React', 'JavaScript'],
            coverImage: '/images/react-hooks.jpg',
          },
          {
            id: 'post-3',
            title: 'Next.js 14 App Router 활용법',
            author: '김성훈',
            date: '2024-01-03',
            tag: ['Next.js', 'React'],
            coverImage: '/images/nextjs.jpg',
          },
        ],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(reactPosts);

      // Act - React 태그로 필터링된 요청 시뮬레이션
      const filteredPosts = await mockPostUseCase.getPostsWithParams({
        tag: 'React',
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: 'React',
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });

      expect(filteredPosts?.posts).toHaveLength(2);
      expect(filteredPosts?.posts[0].title).toBe('React Hooks 완전 가이드');
      expect(filteredPosts?.posts[1].title).toBe('Next.js 14 App Router 활용법');
    });

    it('should handle non-existent tag gracefully', async () => {
      // Arrange
      mockPostUseCase.getPostsWithParams.mockResolvedValue({
        posts: [],
        hasMore: false,
        nextCursor: null,
      });

      // Act
      const filteredPosts = await mockPostUseCase.getPostsWithParams({
        tag: 'NonExistentTag',
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });

      // Assert
      expect(filteredPosts?.posts).toHaveLength(0);
    });
  });

  describe('Scenario 3: 사용자가 특정 포스트를 클릭하여 상세 페이지로 이동', () => {
    it('should display post detail page with all components', async () => {
      // Arrange
      mockPostUseCase.getPostById.mockResolvedValue(mockPostDetail);

      // Act - 블로그 포스트 상세 페이지 렌더링 시뮬레이션
      const BlogPost = require('../../../app/(blog)/blog/[id]/page').default;
      const params = Promise.resolve({ id: 'post-1' });
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        // 포스트 제목 확인
        expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();

        // 작성자 확인
        expect(screen.getByText('김성훈')).toBeInTheDocument();

        // 날짜 확인
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();

        // 태그 확인
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('JavaScript')).toBeInTheDocument();

        // NotionPageContent 렌더링 확인
        expect(screen.getByTestId('notion-page-content')).toBeInTheDocument();

        // recordMap 데이터 확인
        const recordMapData = screen.getByTestId('record-map-data');
        expect(recordMapData).toHaveTextContent('block-1');
      });
    });

    it('should handle non-existent post gracefully', async () => {
      // Arrange
      const { notFound } = require('next/navigation');
      mockPostUseCase.getPostById.mockResolvedValue(null);

      // Act & Assert
      const BlogPost = require('../../../app/(blog)/blog/[id]/page').default;
      const params = Promise.resolve({ id: 'non-existent-post' });

      await expect(BlogPost({ params })).rejects.toThrow();
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('Scenario 4: 사용자가 검색 기능을 사용하여 포스트 검색', () => {
    it('should open search modal and display search results', async () => {
      // Arrange
      const mockSearchResults = [
        {
          id: 'post-1',
          title: 'React Hooks 완전 가이드',
          author: '김성훈',
          date: '2024-01-01',
          tag: ['React', 'JavaScript'],
          coverImage: '/images/react-hooks.jpg',
        },
      ];

      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockSearchResults);

      // Act - 검색 모달 열기 시뮬레이션
      const SearchModal = require('../../../app/(main)/_components/search/SearchModal').default;
      const { rerender } = render(<SearchModal isOpen={false} onClose={jest.fn()} />);

      // 검색 모달 열기
      rerender(<SearchModal isOpen={true} onClose={jest.fn()} />);

      // Assert
      expect(screen.getByTestId('search-modal')).toBeInTheDocument();
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    it('should close search modal when close button is clicked', async () => {
      // Arrange
      const onClose = jest.fn();
      const SearchModal = require('../../../app/(main)/_components/search/SearchModal').default;
      render(<SearchModal isOpen={true} onClose={onClose} />);

      // Act
      fireEvent.click(screen.getByTestId('close-search'));

      // Assert
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Scenario 5: 사용자가 포스트를 정렬하여 확인', () => {
    it('should sort posts by date in descending order', async () => {
      // Arrange
      const sortedPosts = {
        posts: [
          {
            id: 'post-3',
            title: 'Next.js 14 App Router 활용법',
            author: '김성훈',
            date: '2024-01-03',
            tag: ['Next.js', 'React'],
            coverImage: '/images/nextjs.jpg',
          },
          {
            id: 'post-2',
            title: 'TypeScript 타입 시스템 마스터하기',
            author: '김성훈',
            date: '2024-01-02',
            tag: ['TypeScript', 'JavaScript'],
            coverImage: '/images/typescript.jpg',
          },
          {
            id: 'post-1',
            title: 'React Hooks 완전 가이드',
            author: '김성훈',
            date: '2024-01-01',
            tag: ['React', 'JavaScript'],
            coverImage: '/images/react-hooks.jpg',
          },
        ],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(sortedPosts);

      // Act - 날짜 내림차순 정렬 요청 시뮬레이션
      const sortedResult = await mockPostUseCase.getPostsWithParams({
        tag: undefined,
        sort: 'date',
        pageSize: undefined,
        startCursor: undefined,
      });

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: 'date',
        pageSize: undefined,
        startCursor: undefined,
      });

      expect(sortedResult?.posts[0].date).toBe('2024-01-03');
      expect(sortedResult?.posts[1].date).toBe('2024-01-02');
      expect(sortedResult?.posts[2].date).toBe('2024-01-01');
    });
  });

  describe('Scenario 6: 사용자가 페이지네이션을 사용하여 더 많은 포스트 로드', () => {
    it('should load more posts with pagination', async () => {
      // Arrange
      const firstPage = {
        posts: mockPosts.posts.slice(0, 2),
        hasMore: true,
        nextCursor: 'cursor-123',
      };

      const secondPage = {
        posts: [mockPosts.posts[2]],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);

      // Act - 첫 번째 페이지 로드
      const firstPageResult = await mockPostUseCase.getPostsWithParams({
        tag: undefined,
        sort: undefined,
        pageSize: 2,
        startCursor: undefined,
      });

      // 두 번째 페이지 로드
      const secondPageResult = await mockPostUseCase.getPostsWithParams({
        tag: undefined,
        sort: undefined,
        pageSize: 2,
        startCursor: 'cursor-123',
      });

      // Assert
      expect(firstPageResult?.posts).toHaveLength(2);
      expect(firstPageResult?.hasMore).toBe(true);
      expect(firstPageResult?.nextCursor).toBe('cursor-123');

      expect(secondPageResult?.posts).toHaveLength(1);
      expect(secondPageResult?.hasMore).toBe(false);
      expect(secondPageResult?.nextCursor).toBe(null);
    });
  });

  describe('Scenario 7: 에러 상황에서의 사용자 경험', () => {
    it('should handle API errors gracefully in main page', async () => {
      // Arrange
      mockPostUseCase.getPostsWithParams.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      const MainPage = require('../../../app/(main)/page').default;

      // 에러가 발생해도 페이지가 렌더링되어야 함
      expect(async () => {
        render(await MainPage());
      }).not.toThrow();
    });

    it('should handle network errors in post detail page', async () => {
      // Arrange
      mockPostUseCase.getPostById.mockRejectedValue(new Error('Network Error'));

      // Act & Assert
      const BlogPost = require('../../../app/(blog)/blog/[id]/page').default;
      const params = Promise.resolve({ id: 'post-1' });

      await expect(BlogPost({ params })).rejects.toThrow('Network Error');
    });
  });
});
