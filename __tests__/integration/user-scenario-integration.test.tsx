import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { Post, PostMetadata, PostMetadataResp } from '@/domain/entities/post.entity';
import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { diContainer } from '@/shared/di/di-container';
import { jest } from '@jest/globals';

// 테스트 파일은 ESM 으로 실행되므로 정적 import 이전에 적용되는 jest.unstable_mockModule 을 사용하고,
// 페이지 컴포넌트는 모킹 등록 이후 동적 import 로 가져온다.

const mockNotFound = jest.fn<() => never>(() => {
  throw new Error('NEXT_NOT_FOUND');
});

// Mock Next.js navigation
jest.unstable_mockModule('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  notFound: mockNotFound,
}));

// 서버 사이드 Shiki 하이라이터는 무거우므로 빈 결과로 대체
jest.unstable_mockModule('@/presentation/utils/highlight-code-blocks', () => ({
  highlightCodeBlocks: jest.fn(async () => ({})),
}));

// gsap 은 jsdom 에서 파싱/실행되지 않으므로 로드 자체를 막는다
jest.unstable_mockModule('gsap', () => ({
  default: { registerPlugin: jest.fn(), fromTo: jest.fn(), to: jest.fn() },
}));
jest.unstable_mockModule('gsap/ScrollTrigger', () => ({ default: {} }));
jest.unstable_mockModule('@gsap/react', () => ({ useGSAP: jest.fn() }));

// Mock components
jest.unstable_mockModule('@/app/(blog)/_components/NotionPageContent', () => ({
  __esModule: true,
  default: ({ recordMap }: { recordMap: unknown }) => (
    <div data-testid="notion-page-content">
      <div data-testid="record-map-data">{JSON.stringify(recordMap)}</div>
    </div>
  ),
}));

jest.unstable_mockModule('@/app/(blog)/_components/GiscusComments', () => ({
  __esModule: true,
  default: ({ term }: { term: string }) => <div data-testid="giscus-comments">{term}</div>,
}));

jest.unstable_mockModule('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="next-image" {...props} />
  ),
}));

const { default: BlogPost } = await import('@/app/(blog)/blog/[id]/page');

// 실제 diContainer.post 를 타입이 맞는 mock 으로 교체 (getPostDetailPage 는 getDiContainer() 로 같은 싱글톤을 읽는다)
const mockPostUseCase = {
  getPostPropertiesById: jest.fn<PostUseCasePort['getPostPropertiesById']>(),
  getAllPublishedPostMetadatas: jest.fn<PostUseCasePort['getAllPublishedPostMetadatas']>(),
  getPostsWithParams: jest.fn<PostUseCasePort['getPostsWithParams']>(),
  getPostById: jest.fn<PostUseCasePort['getPostById']>(),
  getAboutPage: jest.fn<PostUseCasePort['getAboutPage']>(),
};

describe('User Scenario Integration Tests', () => {
  const mockPosts: PostMetadataResp = {
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

  const mockPostDetail: Post = {
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

  beforeAll(() => {
    diContainer.post = {
      postRepository: diContainer.post.postRepository,
      postUseCase: mockPostUseCase,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostUseCase.getPostsWithParams.mockReset();
    mockPostUseCase.getPostById.mockReset();
    mockPostUseCase.getAllPublishedPostMetadatas.mockReset();
  });

  describe('Scenario 1: 사용자가 특정 태그로 포스트를 필터링', () => {
    it('should filter posts by React tag', async () => {
      // Arrange
      const reactPosts: PostMetadataResp = {
        posts: [mockPosts.posts[0], mockPosts.posts[2]],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(reactPosts);

      // Act - React 태그로 필터링된 요청 시뮬레이션
      const filteredPosts = await diContainer.post.postUseCase.getPostsWithParams({
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

      expect(filteredPosts.posts).toHaveLength(2);
      expect(filteredPosts.posts[0].title).toBe('React Hooks 완전 가이드');
      expect(filteredPosts.posts[1].title).toBe('Next.js 14 App Router 활용법');
    });

    it('should handle non-existent tag gracefully', async () => {
      // Arrange
      mockPostUseCase.getPostsWithParams.mockResolvedValue({
        posts: [],
        hasMore: false,
        nextCursor: null,
      });

      // Act
      const filteredPosts = await diContainer.post.postUseCase.getPostsWithParams({
        tag: 'NonExistentTag',
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });

      // Assert
      expect(filteredPosts.posts).toHaveLength(0);
    });
  });

  describe('Scenario 2: 사용자가 특정 포스트를 클릭하여 상세 페이지로 이동', () => {
    it('should display post detail page with all components', async () => {
      // Arrange
      mockPostUseCase.getPostById.mockResolvedValue(mockPostDetail);

      // Act - 블로그 포스트 상세 페이지 렌더링 시뮬레이션
      const params = Promise.resolve({ id: 'post-1' });
      render(await BlogPost({ params }));

      // Assert
      expect(mockPostUseCase.getPostById).toHaveBeenCalledWith('post-1');

      await waitFor(() => {
        // 포스트 제목 확인
        expect(screen.getByText('React Hooks 완전 가이드')).toBeInTheDocument();

        // 작성자 확인
        expect(screen.getByText('김성훈')).toBeInTheDocument();

        // 날짜 확인 (formatDate: 'PPP' + ko locale)
        expect(screen.getByText('2024년 1월 1일')).toBeInTheDocument();

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
      mockPostUseCase.getPostById.mockResolvedValue(null);

      // Act & Assert
      const params = Promise.resolve({ id: 'non-existent-post' });

      await expect(BlogPost({ params })).rejects.toThrow('NEXT_NOT_FOUND');
      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('Scenario 3: 사용자가 검색 기능을 사용하여 포스트 검색', () => {
    it('should return search candidates from all published post metadatas', async () => {
      // Arrange
      const mockSearchResults: PostMetadata[] = [mockPosts.posts[0]];

      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockSearchResults);

      // Act
      const result = await diContainer.post.postUseCase.getAllPublishedPostMetadatas();

      // Assert
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Hooks 완전 가이드');
    });
  });

  describe('Scenario 4: 사용자가 포스트를 정렬하여 확인', () => {
    it('should sort posts by date in descending order', async () => {
      // Arrange
      const sortedPosts: PostMetadataResp = {
        posts: [mockPosts.posts[2], mockPosts.posts[1], mockPosts.posts[0]],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(sortedPosts);

      // Act - 날짜 내림차순 정렬 요청 시뮬레이션
      const sortedResult = await diContainer.post.postUseCase.getPostsWithParams({
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

      expect(sortedResult.posts[0].date).toBe('2024-01-03');
      expect(sortedResult.posts[1].date).toBe('2024-01-02');
      expect(sortedResult.posts[2].date).toBe('2024-01-01');
    });
  });

  describe('Scenario 5: 사용자가 페이지네이션을 사용하여 더 많은 포스트 로드', () => {
    it('should load more posts with pagination', async () => {
      // Arrange
      const firstPage: PostMetadataResp = {
        posts: mockPosts.posts.slice(0, 2),
        hasMore: true,
        nextCursor: 'cursor-123',
      };

      const secondPage: PostMetadataResp = {
        posts: [mockPosts.posts[2]],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);

      // Act - 첫 번째 페이지 로드
      const firstPageResult = await diContainer.post.postUseCase.getPostsWithParams({
        tag: undefined,
        sort: undefined,
        pageSize: 2,
        startCursor: undefined,
      });

      // 두 번째 페이지 로드
      const secondPageResult = await diContainer.post.postUseCase.getPostsWithParams({
        tag: undefined,
        sort: undefined,
        pageSize: 2,
        startCursor: 'cursor-123',
      });

      // Assert
      expect(firstPageResult.posts).toHaveLength(2);
      expect(firstPageResult.hasMore).toBe(true);
      expect(firstPageResult.nextCursor).toBe('cursor-123');

      expect(secondPageResult.posts).toHaveLength(1);
      expect(secondPageResult.hasMore).toBe(false);
      expect(secondPageResult.nextCursor).toBe(null);
    });
  });

  describe('Scenario 6: 에러 상황에서의 사용자 경험', () => {
    it('should handle network errors in post detail page', async () => {
      // Arrange
      mockPostUseCase.getPostById.mockRejectedValue(new Error('Network Error'));

      // Act & Assert
      const params = Promise.resolve({ id: 'post-1' });

      await expect(BlogPost({ params })).rejects.toThrow('Network Error');
    });
  });
});
