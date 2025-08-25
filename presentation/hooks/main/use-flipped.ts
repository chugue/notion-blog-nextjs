import { TechStackItem } from '@/domain/entities/hex-tech-stack';
import { useEffect, useState } from 'react';

const useFlipped = (selectedTag: string, tech: TechStackItem) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (selectedTag === tech.name) {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [selectedTag, tech.name]);

  return { isFlipped, setIsFlipped };
};

export default useFlipped;
