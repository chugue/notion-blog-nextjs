import { PostMetadata } from './blog';

export interface SearchState {
  // UI 상태
  isOpen: boolean;
  searchQuery: string;
  searchHistory: string[];

  // 데이터 상태
  searchResults: PostMetadata[];
  recentSearches: PostMetadata[];
  favoriteResults: PostMetadata[];

  // 로딩/에러 상태
  isLoading: boolean;
  error: string | null;

  // 설정 상태
  searchSettings: {
    includeContent: boolean;
    searchInTags: boolean;
    maxResults: number;
  };
}

export interface SearchActions {
  // 모달 제어
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;

  // 검색 관련
  setSearchQuery: (query: string) => void;
  searchPosts: (query: string) => Promise<void>;
  clearSearch: () => void;
  addToHistory: (query: string) => void;

  // 즐겨찾기
  addToFavorites: (post: PostMetadata) => void;
  removeFromFavorites: (postId: string) => void;

  // 설정
  updateSettings: (settings: Partial<SearchState['searchSettings']>) => void;

  // 에러 처리
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type SearchStore = SearchState & SearchActions;
