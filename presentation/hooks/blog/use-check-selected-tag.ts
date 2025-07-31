import { useSelectedTagStore } from '@/presentation/stores/use-selected-tag.store';
import { useEffect } from 'react';

export const useCheckSelectedTag = (isFetching: boolean) => {
  const { isChanging, ...store } = useSelectedTagStore();

  useEffect(() => {
    if (!isFetching && isChanging) store.setChanging(false);
  }, [isFetching, isChanging]);

  return { isChanging };
};
