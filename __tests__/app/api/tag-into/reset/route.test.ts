/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tag-into/reset/route';
import { diContainer } from '@/shared/di/di-container';
import { toTagFilterItem } from '@/domain/utils/tag.utils';
import { PostMetadata, TagFilterItem } from '@/domain/entities/blog.entity';
import { PostDependencies } from '@/shared/di/post-dependencies';
import { TagInfoDependencies } from '@/shared/di/tag-info-dependencies';

// Mock dependencies
jest.mock('@/shared/di/di-container');
jest.mock('@/domain/utils/tag.utils');

const mockDiContainer = diContainer as jest.Mocked<typeof diContainer>;
const mockToTagFilterItem = toTagFilterItem as jest.MockedFunction<typeof toTagFilterItem>;

// Mock use cases
const mockPostUseCase = {
  getAllPublishedPostMetadatas: jest.fn(),
  getPublishedPosts: jest.fn(),
  getPostById: jest.fn(),
};

const mockTagInfoUseCase = {
  resetTagInfoList: jest.fn(),
  getAllTags: jest.fn(),
};

// Add mock repositories
const mockPostRepository = {
  getAllPublishedPosts: jest.fn(),
  getPublishedPosts: jest.fn(),
  getPostById: jest.fn(),
};

const mockTagInfoRepository = {
  resetTagInfoList: jest.fn(),
  getAllTags: jest.fn(),
};

describe('API Routes - Tag Info Reset', () => {
  beforeEach(() => {
    mockDiContainer.post = {
      postRepository: mockPostRepository,
      postUseCase: mockPostUseCase,
    } as PostDependencies;
    mockDiContainer.tagInfo = {
      tagInfoRepository: mockTagInfoRepository,
      tagInfoUseCase: mockTagInfoUseCase,
    } as TagInfoDependencies;
    jest.clearAllMocks();
  });

  describe('POST /api/tag-into/reset', () => {
    it('포스트가 있을 때 태그 정보를 성공적으로 리셋해야 한다', async () => {
      // Given
      const mockPostMetadatas: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post 1',
          author: 'Author',
          date: '2024-01-01',
          tag: ['React', 'TypeScript'],
        },
        {
          id: '2',
          title: 'Test Post 2',
          author: 'Author',
          date: '2024-01-02',
          tag: ['Next.js'],
        },
      ];

      const mockTagFilterItems: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 2 },
        { id: 'next.js', name: 'Next.js', count: 1 },
        { id: 'react', name: 'React', count: 1 },
        { id: 'typescript', name: 'TypeScript', count: 1 },
      ];

      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockPostMetadatas);
      mockToTagFilterItem.mockReturnValue(mockTagFilterItems);
      mockTagInfoUseCase.resetTagInfoList.mockResolvedValue(mockTagFilterItems);

      const request = new NextRequest('http://localhost:3000/api/tag-into/reset', {
        method: 'POST',
      });

      // When
      const response = await POST(request);
      const responseData = await response.json();

      // Then
      expect(response.status).toBe(200);
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalledTimes(1);
      expect(mockToTagFilterItem).toHaveBeenCalledWith(mockPostMetadatas);
      expect(mockTagInfoUseCase.resetTagInfoList).toHaveBeenCalledWith(mockTagFilterItems);
      expect(responseData).toEqual({
        success: true,
        data: mockTagFilterItems,
      });
    });

    it('포스트가 없을 때 에러를 반환해야 한다', async () => {
      // Given
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/tag-into/reset', {
        method: 'POST',
      });

      // When
      const response = await POST(request);
      const responseData = await response.json();

      // Then
      expect(response.status).toBe(200);
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalledTimes(1);
      expect(mockToTagFilterItem).not.toHaveBeenCalled();
      expect(mockTagInfoUseCase.resetTagInfoList).not.toHaveBeenCalled();
      expect(responseData).toEqual({
        success: false,
        error: expect.any(Object), // Error object
      });
    });

    it('포스트 조회 중 에러가 발생하면 에러를 전파해야 한다', async () => {
      // Given
      const error = new Error('Failed to fetch posts');
      mockPostUseCase.getAllPublishedPostMetadatas.mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/tag-into/reset', {
        method: 'POST',
      });

      // When & Then
      await expect(POST(request)).rejects.toThrow('Failed to fetch posts');
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalledTimes(1);
      expect(mockToTagFilterItem).not.toHaveBeenCalled();
      expect(mockTagInfoUseCase.resetTagInfoList).not.toHaveBeenCalled();
    });

    it('태그 정보 리셋 중 에러가 발생하면 에러를 전파해야 한다', async () => {
      // Given
      const mockPostMetadatas: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post',
          author: 'Author',
          date: '2024-01-01',
          tag: ['React'],
        },
      ];

      const mockTagFilterItems: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 1 },
        { id: 'react', name: 'React', count: 1 },
      ];

      const error = new Error('Failed to reset tag info');
      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockPostMetadatas);
      mockToTagFilterItem.mockReturnValue(mockTagFilterItems);
      mockTagInfoUseCase.resetTagInfoList.mockRejectedValue(error);

      const request = new NextRequest('http://localhost:3000/api/tag-into/reset', {
        method: 'POST',
      });

      // When & Then
      await expect(POST(request)).rejects.toThrow('Failed to reset tag info');
      expect(mockPostUseCase.getAllPublishedPostMetadatas).toHaveBeenCalledTimes(1);
      expect(mockToTagFilterItem).toHaveBeenCalledWith(mockPostMetadatas);
      expect(mockTagInfoUseCase.resetTagInfoList).toHaveBeenCalledWith(mockTagFilterItems);
    });

    it('단일 포스트가 있을 때도 올바르게 처리해야 한다', async () => {
      // Given
      const mockPostMetadatas: PostMetadata[] = [
        {
          id: '1',
          title: 'Single Post',
          author: 'Author',
          date: '2024-01-01',
          tag: ['React'],
        },
      ];

      const mockTagFilterItems: TagFilterItem[] = [
        { id: 'all', name: '전체', count: 1 },
        { id: 'react', name: 'React', count: 1 },
      ];

      mockPostUseCase.getAllPublishedPostMetadatas.mockResolvedValue(mockPostMetadatas);
      mockToTagFilterItem.mockReturnValue(mockTagFilterItems);
      mockTagInfoUseCase.resetTagInfoList.mockResolvedValue(mockTagFilterItems);

      const request = new NextRequest('http://localhost:3000/api/tag-into/reset', {
        method: 'POST',
      });

      // When
      const response = await POST(request);
      const responseData = await response.json();

      // Then
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        data: mockTagFilterItems,
      });
    });
  });
});
