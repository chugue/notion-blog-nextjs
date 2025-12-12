import { create } from 'zustand';

export interface SelectedTagState {
  selectedTag: string;
  optimisticTag?: string;
  isChanging: boolean;

  setSelectedTag: (tag: string) => void;
  setOptimisticTag: (tag?: string) => void;
  setChanging: (changing: boolean) => void;
}

export const useSelectedTagStore = create<SelectedTagState>((set) => ({
  selectedTag: '전체',
  optimisticTag: undefined,
  isChanging: false,

  setSelectedTag: (tag: string) => set({ selectedTag: tag, optimisticTag: undefined, isChanging: false }),
  setOptimisticTag: (tag?: string) => set({ optimisticTag: tag }),
  setChanging: (changing: boolean) => set({ isChanging: changing }),
}));

// 현재 활성화된 태그를 반환하는 selector
export const selectActiveTag = (state: SelectedTagState) => state.optimisticTag ?? state.selectedTag;
