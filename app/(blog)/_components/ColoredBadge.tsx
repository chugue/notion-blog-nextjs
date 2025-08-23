import { toTagInfo } from '@/presentation/utils/to-tag-Info';
import { Badge } from '@/shared/components/ui/badge';

const ColoredBadge = ({ tag }: { tag: string }) => {
  const tagInfo = toTagInfo(tag);
  return (
    <Badge
      key={tag}
      className="text-xl"
      style={{
        backgroundColor: `color-mix(in srgb, ${tagInfo.color} 10%, transparent)`,
        color: tagInfo.color,
      }}
    >
      {tag}
    </Badge>
  );
};

export default ColoredBadge;
