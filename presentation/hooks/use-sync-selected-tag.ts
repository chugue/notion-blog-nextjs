'use client';

import { useEffect } from 'react';
import { useSelectedTagStore } from '../stores/use-selected-tag.store';

export const useSyncSelectedTag = (serverTag: string) => {
  const setSelectedTag = useSelectedTagStore((state) => state.setSelectedTag);

  useEffect(() => {
    setSelectedTag(serverTag);
  }, [serverTag, setSelectedTag]);
};
