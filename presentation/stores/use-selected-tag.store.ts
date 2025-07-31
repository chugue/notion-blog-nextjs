import { create } from 'zustand';

export interface SelectedTagState {
  selectedTag: string;
  isChanging: boolean;
  optimisticTag?: string;

  setSelectedTag: (tag: string) => void;
  setChanging: (changing: boolean) => void;
  setOptimisticTag: (tag?: string) => void;
}

export const useSelectedTagStore = create<SelectedTagState>((set) => ({
  selectedTag: '전체',
  isChanging: false,
  optimisticTag: undefined,

  setSelectedTag: (tag: string) => set({ selectedTag: tag }),
  setChanging: (changing: boolean) => set({ isChanging: changing }),
  setOptimisticTag: (tag?: string) => set({ optimisticTag: tag }),
}));
