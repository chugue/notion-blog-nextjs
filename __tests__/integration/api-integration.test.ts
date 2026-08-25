import { GET as notionGET } from '@/app/api/notion/route';
import { GET as searchGET } from '@/app/api/search/route';
import { PostMetadata, PostMetadataResp } from '@/domain/entities/post.entity';
import { PostUseCasePort } from '@/presentation/ports/post-usecase.port';
import { diContainer } from '@/shared/di/di-container';
import { jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// next/server(NextResponse.json, NextRequest)는 jest.setup.js에서 전역 모킹됨

// 실제 diContainer.post 를 타입이 맞는 mock 으로 교체 (site-metrics route 테스트와 동일 패턴)
const mockPostUseCase = {
  getPostPropertiesById: jest.fn<PostUseCasePort['getPostPropertiesById']>(),
  getAllPublishedPostMetadatas: jest.fn<PostUseCasePort['getAllPublishedPostMetadatas']>(),
  getPostsWithParams: jest.fn<PostUseCasePort['getPostsWithParams']>(),
  getPostById: jest.fn<PostUseCasePort['getPostById']>(),
  getAboutPage: jest.fn<PostUseCasePort['getAboutPage']>(),
};

describe('API Integration Tests', () => {
  beforeAll(() => {
    diContainer.post = {
      postRepository: diContainer.post.postRepository,
      postUseCase: mockPostUseCase,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostUseCase.getPostsWithParams.mockReset();
    mockPostUseCase.getAllPublishedPostMetadatas.mockReset();
  });

  describe('/api/notion - GET Posts with Parameters', () => {
    it('should return posts with default parameters', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [
          {
            id: 'post-1',
            title: 'Test Post 1',
            author: '김성훈',
            date: '2024-01-01',
            tag: ['React'],
            coverImage: '/images/test1.jpg',
          },
        ],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest('http://localhost:3000/api/notion');
      const response = await notionGET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });

      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it('should return posts with query parameters', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [
          {
            id: 'post-2',
            title: 'Test Post 2',
            author: '김성훈',
            date: '2024-01-02',
            tag: ['TypeScript'],
            coverImage: '/images/test2.jpg',
          },
        ],
        hasMore: true,
        nextCursor: 'cursor-123',
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest(
        'http://localhost:3000/api/notion?tag=React&sort=date&pageSize=10&startCursor=cursor-123'
      );
      const response = await notionGET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: 'React',
        sort: 'date',
        pageSize: 10,
        startCursor: 'cursor-123',
      });

      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockEmptyPosts: PostMetadataResp = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockEmptyPosts);

      const request = new NextRequest('http://localhost:3000/api/notion');
      const response = await notionGET(request);

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockEmptyPosts,
      });
    });

    it('should handle invalid pageSize parameter', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest('http://localhost:3000/api/notion?pageSize=invalid');
      const response = await notionGET(request);

      // Assert
      // Number('invalid') === NaN 이고, 라우트는 `|| undefined` 로 정규화한다
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });
    });
  });

  describe('/api/search - GET All Post Metadatas', () => {
    it('should return all published post metadatas', async () => {
      // Arrange
      const mockMetadatas: PostMetadata[] = [
        {
          id: 'post-1',
          title: 'Test Post 1',
          author: '김성훈',
          date: '2024-01-01',
          tag: ['React'],
          coverImage: '/images/test1.jpg',
        },
        {
          id: 'post-2',
          title: 'Test Post 2',
          author: '김성훈',
          date: '2024-01-02',
          tag: ['TypeScript'],
          coverImage: '/images/test2.jpg',
        },
      ];

      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockMetadatas);

      const response = await searchGET();

      // Assert
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetadatas,
      });
    });

    it('should handle empty metadatas', async () => {
      // Arrange
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue([]);

      const response = await searchGET();

      // Assert
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency between API calls', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [
          {
            id: 'post-1',
            title: 'Test Post 1',
            author: '김성훈',
            date: '2024-01-01',
            tag: ['React'],
            coverImage: '/images/test1.jpg',
          },
        ],
        hasMore: false,
        nextCursor: null,
      };

      const mockMetadatas: PostMetadata[] = [
        {
          id: 'post-1',
          title: 'Test Post 1',
          author: '김성훈',
          date: '2024-01-01',
          tag: ['React'],
          coverImage: '/images/test1.jpg',
        },
      ];

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockMetadatas);

      const notionRequest = new NextRequest('http://localhost:3000/api/notion');

      const notionResponse = await notionGET(notionRequest);
      const searchResponse = await searchGET();

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalled();
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();

      // Verify that both APIs return consistent data structure
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });

      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetadatas,
      });
    });

    it('should handle concurrent API calls', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue([]);

      const notionRequest = new NextRequest('http://localhost:3000/api/notion');

      const [notionResponse, searchResponse] = await Promise.all([
        notionGET(notionRequest),
        searchGET(),
      ]);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalled();
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed query parameters', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest(
        'http://localhost:3000/api/notion?tag=&sort=&pageSize=&startCursor='
      );
      const response = await notionGET(request);

      // Assert
      // 빈 문자열은 라우트에서 `|| undefined` 로 정규화된다
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });
    });

    it('should handle very large pageSize values', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest('http://localhost:3000/api/notion?pageSize=999999');
      const response = await notionGET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: undefined,
        pageSize: 999999,
        startCursor: undefined,
      });
    });

    it('should handle special characters in query parameters', async () => {
      // Arrange
      const mockPosts: PostMetadataResp = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest(
        'http://localhost:3000/api/notion?tag=React%20%26%20TypeScript&sort=date%20desc'
      );
      const response = await notionGET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: 'React & TypeScript',
        sort: 'date desc',
        pageSize: undefined,
        startCursor: undefined,
      });
    });
  });
});
