import { tagMatchColor } from '@/presentation/utils/match-colors';
import { Badge } from '@/shared/components/ui/badge';
import React from 'react';

const CustomBadge = ({ tag }: { tag: string }) => {
  const color = tagMatchColor(tag);

  return (
    <Badge
      key={tag}
      variant="secondary"
      className={`font-medium transition-colors`}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        color: color,
      }}
    >
      {tag}
    </Badge>
  );
};

export default CustomBadge;
