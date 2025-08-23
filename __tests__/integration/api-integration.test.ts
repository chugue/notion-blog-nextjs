import { NextRequest } from 'next/server';
import { diContainer } from '../../shared/di/di-container';

// Mock dependencies
jest.mock('../../shared/di/di-container', () => ({
  diContainer: {
    post: {
      postUseCase: {
        getPostsWithParams: jest.fn(),
        getAllPublishedPostMetadatas: jest.fn(),
      },
    },
  },
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

describe('API Integration Tests', () => {
  const mockPostUseCase = diContainer.post.postUseCase as jest.Mocked<
    typeof diContainer.post.postUseCase
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/notion - GET Posts with Parameters', () => {
    it('should return posts with default parameters', async () => {
      // Arrange
      const mockPosts = {
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
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: undefined,
        pageSize: undefined,
        startCursor: undefined,
      });

      const { NextResponse } = require('next/server');
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it('should return posts with query parameters', async () => {
      // Arrange
      const mockPosts = {
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
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: 'React',
        sort: 'date',
        pageSize: 10,
        startCursor: 'cursor-123',
      });

      const { NextResponse: NextResponse2 } = require('next/server');
      expect(NextResponse2.json).toHaveBeenCalledWith({
        success: true,
        data: mockPosts,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      const mockEmptyPosts = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockEmptyPosts);

      const request = new NextRequest('http://localhost:3000/api/notion');
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

      // Assert
      const { NextResponse } = require('next/server');
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockEmptyPosts,
      });
    });

    it('should handle API errors', async () => {
      // Arrange
      mockPostUseCase.getPostsWithParams.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/notion');
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

      // Assert
      const { NextResponse } = require('next/server');
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: false,
        error: new Error('Failed to get published posts'),
      });
    });

    it('should handle invalid pageSize parameter', async () => {
      // Arrange
      const mockPosts = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest('http://localhost:3000/api/notion?pageSize=invalid');
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: undefined,
        sort: undefined,
        pageSize: NaN,
        startCursor: undefined,
      });
    });
  });

  describe('/api/search - GET All Post Metadatas', () => {
    it('should return all published post metadatas', async () => {
      // Arrange
      const mockMetadatas = [
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

      const { GET } = require('../../../app/api/search/route');

      // Act
      const response = await GET();

      // Assert
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();
      const { NextResponse } = require('next/server');
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetadatas,
      });
    });

    it('should handle empty metadatas', async () => {
      // Arrange
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue([]);

      const { GET } = require('../../../app/api/search/route');

      // Act
      const response = await GET();

      // Assert
      const { NextResponse } = require('next/server');
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should handle API errors', async () => {
      // Arrange
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(null);

      const { GET } = require('../../../app/api/search/route');

      // Act
      const response = await GET();

      // Assert
      const { NextResponse } = require('next/server');
      expect(NextResponse.json).toHaveBeenCalledWith({
        success: false,
        error: new Error('Failed to get posts'),
      });
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency between API calls', async () => {
      // Arrange
      const mockPosts = {
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

      const mockMetadatas = [
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
      const searchRequest = {};

      const { GET: notionGET } = require('../../../app/api/notion/route');
      const { GET: searchGET } = require('../../../app/api/search/route');

      // Act
      const notionResponse = await notionGET(notionRequest);
      const searchResponse = await searchGET(searchRequest);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalled();
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();

      // Verify that both APIs return consistent data structure
      const { NextResponse } = require('next/server');
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
      const mockPosts = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue([]);

      const notionRequest = new NextRequest('http://localhost:3000/api/notion');
      const searchRequest = {};

      const { GET: notionGET } = require('../../../app/api/notion/route');
      const { GET: searchGET } = require('../../../app/api/search/route');

      // Act
      const [notionResponse, searchResponse] = await Promise.all([
        notionGET(notionRequest),
        searchGET(searchRequest),
      ]);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalled();
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed query parameters', async () => {
      // Arrange
      const mockPosts = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest(
        'http://localhost:3000/api/notion?tag=&sort=&pageSize=&startCursor='
      );
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

      // Assert
      expect(mockPostUseCase.getPostsWithParams).toHaveBeenCalledWith({
        tag: '',
        sort: '',
        pageSize: 0,
        startCursor: '',
      });
    });

    it('should handle very large pageSize values', async () => {
      // Arrange
      const mockPosts = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest('http://localhost:3000/api/notion?pageSize=999999');
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

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
      const mockPosts = {
        posts: [],
        hasMore: false,
        nextCursor: null,
      };

      mockPostUseCase.getPostsWithParams.mockResolvedValue(mockPosts);

      const request = new NextRequest(
        'http://localhost:3000/api/notion?tag=React%20%26%20TypeScript&sort=date%20desc'
      );
      const { GET } = require('../../../app/api/notion/route');

      // Act
      const response = await GET(request);

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
