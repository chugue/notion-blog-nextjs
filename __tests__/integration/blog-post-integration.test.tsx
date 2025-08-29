import BlogPost from '../../../app/(blog)/blog/[id]/page';
import { diContainer } from '../../../shared/di/di-container';
import { render, screen, waitFor } from '../../utils/test-utils';

// Mock dependencies
jest.mock('../../../shared/di/di-container', () => ({
  diContainer: {
    post: {
      postUseCase: {
        getPostById: jest.fn(),
      },
    },
  },
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('../../../presentation/utils/get-post-detail-page', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock NotionPageContent component
jest.mock('../../../app/(blog)/_components/NotionPageContent', () => ({
  __esModule: true,
  default: ({ recordMap }: { recordMap: unknown }) => (
    <div data-testid="notion-page-content">
      <div data-testid="record-map-data">{JSON.stringify(recordMap)}</div>
    </div>
  ),
}));

// Mock GiscusComments component
jest.mock('../../../app/(blog)/_components/GiscusComments', () => ({
  __esModule: true,
  default: ({ term }: { term: string }) => (
    <div data-testid="giscus-comments">
      <div data-testid="comment-term">{term}</div>
    </div>
  ),
}));

// Mock ColoredBadge component
jest.mock('../../../app/(blog)/_components/ColoredBadge', () => ({
  __esModule: true,
  default: ({ tag }: { tag: string }) => (
    <span data-testid="colored-badge" data-tag={tag}>
      {tag}
    </span>
  ),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} data-testid="next-image" {...props} />
  ),
}));

describe('Blog Post Integration Tests', () => {
  const mockPostUseCase = diContainer.post.postUseCase as jest.Mocked<
    typeof diContainer.post.postUseCase
  >;
  const mockGetPostDetailPage = require('../../../presentation/utils/get-post-detail-page')
    .default as jest.MockedFunction<
    typeof import('../../../presentation/utils/get-post-detail-page').default
  >;

  const mockPostData = {
    properties: {
      id: 'test-post-id',
      title: 'Test Blog Post Title',
      author: '김성훈',
      date: '2024-01-01',
      tag: ['React', 'TypeScript', 'Next.js'],
      coverImage: '/images/test-cover.jpg',
    },
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

        // Check if date is rendered
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();

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
      const postDataWithoutCover = {
        ...mockPostData,
        properties: {
          ...mockPostData.properties,
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
      const postDataWithoutTags = {
        ...mockPostData,
        properties: {
          ...mockPostData.properties,
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
      const { notFound } = require('next/navigation');
      mockGetPostDetailPage.mockResolvedValue({ properties: null, recordMap: null });
      const params = Promise.resolve({ id: 'non-existent-post' });

      // Act & Assert
      await expect(BlogPost({ params })).rejects.toThrow();
      expect(notFound).toHaveBeenCalled();
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
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();

        // Check if tags are rendered with correct data attributes
        const reactBadge = screen.getByTestId('colored-badge');
        expect(reactBadge).toHaveAttribute('data-tag', 'React');
      });
    });
  });

  describe('SEO and Metadata', () => {
    it('should include structured data schema', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      const { container } = render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        const scriptElement = container.querySelector('script[type="application/ld+json"]');
        expect(scriptElement).toBeInTheDocument();

        const schemaContent = scriptElement?.getAttribute('dangerouslySetInnerHTML');
        expect(schemaContent).toContain('BlogPosting');
        expect(schemaContent).toContain('Test Blog Post Title');
        expect(schemaContent).toContain('김성훈');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile table of contents', async () => {
      // Arrange
      mockGetPostDetailPage.mockResolvedValue(mockPostData);
      const params = Promise.resolve({ id: 'test-post-id' });

      // Act
      render(await BlogPost({ params }));

      // Assert
      await waitFor(() => {
        const tocDetails = screen.getByText('목차');
        expect(tocDetails).toBeInTheDocument();
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
