import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import { Post, PostMetadata } from '@/domain/entities/post.entity';
import type getPostDetailPage from '@/presentation/utils/get-post-detail-page';
import { jest } from '@jest/globals';

// 테스트 파일은 ESM 으로 실행되므로 정적 import 이전에 적용되는 jest.unstable_mockModule 을 사용하고,
// 페이지 컴포넌트는 모킹 등록 이후 동적 import 로 가져온다.

const mockGetPostDetailPage = jest.fn<typeof getPostDetailPage>();
const mockNotFound = jest.fn<() => never>();

jest.unstable_mockModule('@/presentation/utils/get-post-detail-page', () => ({
  __esModule: true,
  default: mockGetPostDetailPage,
}));

jest.unstable_mockModule('next/navigation', () => ({
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

// Mock NotionPageContent component
jest.unstable_mockModule('@/app/(blog)/_components/NotionPageContent', () => ({
  __esModule: true,
  default: ({ recordMap }: { recordMap: unknown }) => (
    <div data-testid="notion-page-content">
      <div data-testid="record-map-data">{JSON.stringify(recordMap)}</div>
    </div>
  ),
}));

// Mock GiscusComments component
jest.unstable_mockModule('@/app/(blog)/_components/GiscusComments', () => ({
  __esModule: true,
  default: ({ term }: { term: string }) => (
    <div data-testid="giscus-comments">
      <div data-testid="comment-term">{term}</div>
    </div>
  ),
}));

// Mock ColoredBadge component
jest.unstable_mockModule('@/app/(blog)/_components/ColoredBadge', () => ({
  __esModule: true,
  default: ({ tag }: { tag: string }) => (
    <span data-testid="colored-badge" data-tag={tag}>
      {tag}
    </span>
  ),
}));

// Mock Next.js Image component
jest.unstable_mockModule('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="next-image" {...props} />
  ),
}));

const { default: BlogPost } = await import('@/app/(blog)/blog/[id]/page');

describe('Blog Post Integration Tests', () => {
  const mockProperties: PostMetadata = {
    id: 'test-post-id',
    title: 'Test Blog Post Title',
    author: '김성훈',
    date: '2024-01-01',
    tag: ['React', 'TypeScript', 'Next.js'],
    coverImage: '/images/test-cover.jpg',
  };

  const mockPostData: Post = {
    properties: mockProperties,
    recordMap: {
      block: {
        'test-block-id': {
          role: 'reader',
          value: {
            id: 'test-block-id',
            type: 'text',
            properties: {
              title: [['Test Content']],
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

  describe('Successful Blog Post Rendering', () => {
    it('should render complete blog post page with all components', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        // Check if title is rendered
        expect(screen.getByText('Test Blog Post Title')).toBeInTheDocument();

        // Check if author is rendered
        expect(screen.getByText('김성훈')).toBeInTheDocument();

        // Check if date is rendered (formatDate: 'PPP' + ko locale)
        expect(screen.getByText('2024년 1월 1일')).toBeInTheDocument();

        // Check if tags are rendered
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Next.js')).toBeInTheDocument();

        // Check if cover image is rendered
        const coverImage = screen.getByTestId('next-image');
        expect(coverImage).toHaveAttribute('src', '/images/test-cover.jpg');
        expect(coverImage).toHaveAttribute('alt', 'Test Blog Post Title');

        // Check if NotionPageContent is rendered
        expect(screen.getByTestId('notion-page-content')).toBeInTheDocument();

        // Check if GiscusComments is rendered
        expect(screen.getByTestId('giscus-comments')).toBeInTheDocument();
        expect(screen.getByTestId('comment-term')).toHaveTextContent('blog-test-post-id');
      });
    });

    it('should handle blog post without cover image', async () => {
      // Arrange
      const postDataWithoutCover: Post = {
        ...mockPostData,
        properties: {
          ...mockProperties,
          coverImage: undefined,
        },
      };
      mockGetPostDetailPage.mockResolvedValue(postDataWithoutCover);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        const coverImage = screen.getByTestId('next-image');
        expect(coverImage).toHaveAttribute('src', '/images/no-image-dark.png');
      });
    });

    it('should handle blog post without tags', async () => {
      // Arrange
      const postDataWithoutTags: Post = {
        ...mockPostData,
        properties: {
          ...mockProperties,
          tag: [],
        },
      };
      mockGetPostDetailPage.mockResolvedValue(postDataWithoutTags);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Test Blog Post Title')).toBeInTheDocument();
        // Tags should not be rendered
        expect(screen.queryByTestId('colored-badge')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should call notFound when post is not found', async () => {
      // Arrange
      // getPostDetailPage 는 포스트가 없으면 notFound() 를 호출한다 (실제 구현과 동일하게 시뮬레이션)
      mockNotFound.mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
      });
      mockGetPostDetailPage.mockImplementation(async () => {
        mockNotFound();
        throw new Error('unreachable');
      });
      const params = Promise.resolve({ id: 'non-existent-post' });

      // Act & Assert
      await expect(BlogPost({ params })).rejects.toThrow('NEXT_NOT_FOUND');
      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      mockGetPostDetailPage.mockRejectedValue(new Error('API Error'));
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act & Assert
      await expect(BlogPost({ params })).rejects.toThrow('API Error');
    });
  });

  describe('Data Flow Integration', () => {
    it('should pass correct recordMap to NotionPageContent', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        const recordMapData = screen.getByTestId('record-map-data');
        expect(recordMapData).toHaveTextContent('test-block-id');
      });
    });

    it('should pass correct properties to page components', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        // Check if all properties are correctly passed and rendered
        expect(screen.getByText('Test Blog Post Title')).toBeInTheDocument();
        expect(screen.getByText('김성훈')).toBeInTheDocument();
        expect(screen.getByText('2024년 1월 1일')).toBeInTheDocument();

        // Check if tags are rendered with correct data attributes
        const badges = screen.getAllByTestId('colored-badge');
        expect(badges[0]).toHaveAttribute('data-tag', 'React');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render table of contents', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        // 모바일 목차(MobileToc) + 데스크톱 목차(TableOfContentsWrapper)
        expect(screen.getAllByText('목차').length).toBeGreaterThan(0);
      });
    });

    it('should have correct grid layout classes', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      const { container } = render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        const mainGrid = container.querySelector('.grid');
        expect(mainGrid).toHaveClass(
          'grid-cols-1',
          'md:grid-cols-[1fr_220px]',
          'xl:grid-cols-[250px_1fr_300px]'
        );
      });
    });
  });
});
