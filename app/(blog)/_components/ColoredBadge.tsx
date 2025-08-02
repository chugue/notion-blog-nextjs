import { tagMatchColor } from '@/presentation/utils/match-colors';
import { Badge } from '@/shared/components/ui/badge';
import React from 'react';

const ColoredBadge = ({ tag }: { tag: string }) => {
  const color = tagMatchColor(tag);
  return (
    <Badge
      key={tag}
      className="text-xl"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        color: color,
      }}
    >
      {tag}
    </Badge>
  );
};

export default ColoredBadge;
