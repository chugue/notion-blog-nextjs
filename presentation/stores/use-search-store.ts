import { create } from 'zustand';
import { PostMetadata } from '../../domain/entities/post.entity';

interface SearchState {
  // 모달 상태
  isOpen: boolean;
  searchQuery: string;
  searchResults: PostMetadata[];
  isLoading: boolean;

  // 액션들
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: PostMetadata[]) => void;
  setLoading: (loading: boolean) => void;
  clearSearch: () => void;

  // 검색 함수
  searchPosts: (query: string) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  // 초기 상태
  isOpen: false,
  searchQuery: '',
  searchResults: [],
  isLoading: false,

  // 모달 제어
  openModal: () => set({ isOpen: true }),
  closeModal: () =>
    set({
      isOpen: false,
      searchQuery: '',
      searchResults: [],
    }),
  toggleModal: () => set((state) => ({ isOpen: !state.isOpen })),

  // 검색 상태 관리
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSearch: () =>
    set({
      searchQuery: '',
      searchResults: [],
    }),

  // 검색 로직 👈
  searchPosts: async (query: string) => {
    const { setLoading, setSearchResults } = get();

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/notion');
      const data = await response.json();

      if (data.posts) {
        const filtered = data.posts.filter(
          (post: PostMetadata) =>
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.tag?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  },
}));
