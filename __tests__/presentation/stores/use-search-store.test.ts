import { act, renderHook } from '@testing-library/react';
import { useSearchStore } from '@/presentation/stores/use-search-store';
import { PostMetadata } from '@/domain/entities/blog.entity';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Presentation Stores - useSearchStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSearchStore.setState({
      isOpen: false,
      searchQuery: '',
      searchResults: [],
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  describe('모달 상태 관리', () => {
    it('초기 상태가 올바르게 설정되어야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('openModal이 모달을 열어야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('closeModal이 모달을 닫고 상태를 초기화해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      // 먼저 상태를 설정
      act(() => {
        result.current.openModal();
        result.current.setSearchQuery('test query');
        result.current.setSearchResults([
          {
            id: '1',
            title: 'Test Post',
            author: 'Author',
            date: '2024-01-01',
            tag: ['React'],
          },
        ]);
      });

      // closeModal 실행
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
    });

    it('toggleModal이 모달 상태를 토글해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.toggleModal();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggleModal();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('검색 상태 관리', () => {
    it('setSearchQuery가 검색 쿼리를 설정해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setSearchQuery('test query');
      });

      expect(result.current.searchQuery).toBe('test query');
    });

    it('setSearchResults가 검색 결과를 설정해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());
      const mockResults: PostMetadata[] = [
        {
          id: '1',
          title: 'Test Post',
          author: 'Author',
          date: '2024-01-01',
          tag: ['React'],
        },
      ];

      act(() => {
        result.current.setSearchResults(mockResults);
      });

      expect(result.current.searchResults).toEqual(mockResults);
    });

    it('setLoading이 로딩 상태를 설정해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('clearSearch가 검색 상태를 초기화해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      // 먼저 상태를 설정
      act(() => {
        result.current.setSearchQuery('test query');
        result.current.setSearchResults([
          {
            id: '1',
            title: 'Test Post',
            author: 'Author',
            date: '2024-01-01',
            tag: ['React'],
          },
        ]);
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.searchResults).toEqual([]);
    });
  });

  describe('검색 기능', () => {
    it('빈 쿼리로 검색하면 결과를 초기화해야 한다', async () => {
      const { result } = renderHook(() => useSearchStore());

      await act(async () => {
        await result.current.searchPosts('');
      });

      expect(result.current.searchResults).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('공백만 있는 쿼리로 검색하면 결과를 초기화해야 한다', async () => {
      const { result } = renderHook(() => useSearchStore());

      await act(async () => {
        await result.current.searchPosts('   ');
      });

      expect(result.current.searchResults).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('유효한 쿼리로 검색이 성공하면 결과를 설정해야 한다', async () => {
      const mockPosts: PostMetadata[] = [
        {
          id: '1',
          title: 'React Tutorial',
          author: 'Author',
          date: '2024-01-01',
          tag: ['React'],
        },
        {
          id: '2',
          title: 'TypeScript Guide',
          author: 'Author',
          date: '2024-01-02',
          tag: ['TypeScript'],
        },
      ];

      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ posts: mockPosts }),
      });

      const { result } = renderHook(() => useSearchStore());

      await act(async () => {
        await result.current.searchPosts('react');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/notion');
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].title).toBe('React Tutorial');
      expect(result.current.isLoading).toBe(false);
    });

    it('검색 중에 로딩 상태가 올바르게 관리되어야 한다', async () => {
      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue({ posts: [] }),
      });

      const { result } = renderHook(() => useSearchStore());

      const searchPromise = act(async () => {
        await result.current.searchPosts('test');
      });

      // 로딩 상태 확인은 비동기적으로 처리되므로 추가적인 테스트 필요
      await searchPromise;

      expect(result.current.isLoading).toBe(false);
    });

    it('검색 중 에러가 발생하면 빈 결과를 설정하고 로딩을 끝내야 한다', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockFetch.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useSearchStore());

      await act(async () => {
        await result.current.searchPosts('test');
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('검색 중 오류 발생:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});
