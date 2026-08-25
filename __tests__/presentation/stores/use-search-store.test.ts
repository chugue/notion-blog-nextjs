import { act, renderHook } from '@testing-library/react';
import { useSearchStore } from '@/presentation/stores/use-search.store';
import { PostMetadata } from '@/domain/entities/post.entity';

describe('Presentation Stores - useSearchStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSearchStore.setState({
      isOpen: false,
      searchQuery: '',
      searchResults: [],
      isLoading: false,
    });
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

    it('closeModal은 로딩 상태를 건드리지 않아야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openModal();
        result.current.setLoading(true);
      });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.isLoading).toBe(true);
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

    it('setSearchResults에 빈 배열을 넘기면 결과를 비워야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
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
        result.current.setSearchResults([]);
      });

      expect(result.current.searchResults).toEqual([]);
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

    it('clearSearch는 모달 열림 상태를 유지해야 한다', () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openModal();
        result.current.setSearchQuery('test query');
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.searchQuery).toBe('');
    });
  });
});
