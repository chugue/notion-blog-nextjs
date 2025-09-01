import { TechStackItem } from '@/domain/entities/hex-tech-stack';
import { useEffect, useState } from 'react';

const useFlipped = (selectedTag: string, tech: TechStackItem) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (selectedTag === tech.tagName) {
      console.log('selectedTag', selectedTag);
      console.log('tech.tagName', tech.tagName);
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [selectedTag, tech.tagName]);

  return { isFlipped, setIsFlipped };
};

export default useFlipped;
