'use client';

import { TagFilterItem } from '@/domain/entities/post.entity';
import { useSelectedTagStore } from '@/presentation/stores/use-selected-tag.store';
import { toTagInfo } from '@/presentation/utils/to-tag-Info';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/tailwind-cn';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';
import SearchButton from '../search/SearchButton';

export interface TagSectionProps {
  tags: Promise<TagFilterItem[]>;
  selectedTag?: string;
}

const TagSection = ({ tags }: TagSectionProps) => {
  const allTags = use(tags);

  const { selectedTag, isChanging, ...store } = useSelectedTagStore();

  const handleTagClick = (tagName: string) => {
    store.setSelectedTag(tagName);
    store.setChanging(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <CardTitle>태그목록</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <SearchButton />
        <div className="mt-3 flex flex-col gap-3 max-md:overflow-y-auto max-md:overscroll-contain">
          {allTags.map((tag) => {
            const tagInfo = toTagInfo(tag.name);
            const isSelected = selectedTag === tag.name || (!selectedTag && tag.name === '전체');
            return (
              <Link
                href={tag.name === '전체' ? '/' : `?tag=${encodeURIComponent(tag.name)}`}
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                prefetch={true}
              >
                <div
                  className={cn(
                    'flex items-center justify-between rounded-md px-4 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted-foreground/10 text-muted-foreground'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Image
                      src={tagInfo.icon}
                      alt={tag.name}
                      width={16}
                      height={16}
                      className="h-5 w-5"
                    />
                    {tag.name}
                  </span>
                  <span>{tag.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagSection;
