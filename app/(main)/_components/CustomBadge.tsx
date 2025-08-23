import { toTagInfo } from '@/presentation/utils/to-tag-Info';
import { Badge } from '@/shared/components/ui/badge';

const CustomBadge = ({ tag }: { tag: string }) => {
  const tagInfo = toTagInfo(tag);

  return (
    <Badge
      key={tag}
      variant="secondary"
      className={`font-medium transition-colors`}
      style={{
        backgroundColor: `color-mix(in srgb, ${tagInfo.color} 10%, transparent)`,
        color: tagInfo.color,
      }}
    >
      {tag}
    </Badge>
  );
};

export default CustomBadge;
