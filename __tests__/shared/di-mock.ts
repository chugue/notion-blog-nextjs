import { jest } from '@jest/globals';

// Mock PostUseCase and TagInfoUseCase interfaces
export const mockPostUseCase = {
  getPostsWithParams: jest.fn(),
  getAllPublishedPostMetadatas: jest.fn(),
};

export const mockTagInfoUseCase = {
  getTags: jest.fn(),
  getTagInfo: jest.fn(),
};

// Manually construct the mocked diContainer structure
export const mockDiContainer = {
  post: {
    postUseCase: mockPostUseCase,
  },
  tagInfo: {
    tagInfoUseCase: mockTagInfoUseCase,
  },
  // Add other parts of diContainer if they are accessed by integration tests
};

// Helper function to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockPostUseCase.getPostsWithParams.mockReset();
  mockPostUseCase.getAllPublishedPostMetadatas.mockReset();
  mockTagInfoUseCase.getTags.mockReset();
  mockTagInfoUseCase.getTagInfo.mockReset();
};
