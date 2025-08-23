import { toTagInfo } from '@/presentation/utils/to-tag-Info';
import { TechStackItem } from '../entities/hex-tech-stack';
import { TagFilterItem } from '../entities/post.entity';

export const toHexTechStackItem = (tagFilterItems: TagFilterItem[]): TechStackItem[] => {
  const techStackItems: TechStackItem[] = [];

  tagFilterItems.forEach((tagFilterItem) => {
    const tagInfo = toTagInfo(tagFilterItem.name);
    techStackItems.push({
      name: tagInfo.name,
      icon: tagInfo.icon,
      color: tagInfo.color,
      tagName: tagInfo.tagName,
    });
  });

  return techStackItems;
};
