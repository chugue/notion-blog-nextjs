import { TechStackItem } from '@/domain/entities/post.entity';
import { getHoneycombPositions } from '@/presentation/utils/get-honecomb-positions';
import { useMemo } from 'react';

export const useHoneycombMemo = (techStacks: TechStackItem[]) => {
  const { positions, honeycombWidth } = useMemo(() => {
    const positions = getHoneycombPositions(techStacks.length);
    const radius = 48;
    const maxX = Math.max(...positions.map((pos) => pos.x));
    const honeycombWidth = maxX + radius;

    return { positions, honeycombWidth };
  }, [techStacks.length]);

  return { positions, honeycombWidth };
};
