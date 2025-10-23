import { create } from 'zustand';

export interface SelectedTagState {
  isChanging: boolean;
  optimisticTag?: string;

  setChanging: (changing: boolean) => void;
  setOptimisticTag: (tag?: string) => void;
}

export const useSelectedTagStore = create<SelectedTagState>((set) => ({
  isChanging: false,
  optimisticTag: undefined,

  setChanging: (changing: boolean) => set({ isChanging: changing }),
  setOptimisticTag: (tag?: string) => set({ optimisticTag: tag }),
}));
