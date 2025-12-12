import { TechStackItem } from '@/domain/entities/hex-tech-stack';
import { useEffect, useState } from 'react';
import { selectActiveTag, useSelectedTagStore } from '../../stores/use-selected-tag.store';

const useFlipped = (tech: TechStackItem) => {
  const activeTag = useSelectedTagStore(selectActiveTag);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (activeTag === tech.tagName) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [activeTag, tech.tagName]);

  return { isFlipped, setIsFlipped, activeTag };
};

export default useFlipped;
