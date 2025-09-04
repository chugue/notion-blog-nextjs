'use client';

import { TagFilterItem } from '@/domain/entities/post.entity';
import { useSelectedTagStore } from '@/presentation/stores/use-selected-tag.store';
import { toTagInfo } from '@/presentation/utils/to-tag-Info';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/tailwind-cn';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import SearchButton from '../search/SearchButton';

export interface TagSectionProps {
  tags: Promise<TagFilterItem[]>;
  selectedTag?: string;
}

const TagSection = ({ tags }: TagSectionProps) => {
  const { selectedTag, isChanging, ...store } = useSelectedTagStore();
  const allTags = use(tags);
  const [expanded, setExpanded] = useState(false);
  const indicator = document.querySelector('.indicator');
  const tabRow = document.querySelector('.tabs-row');

  const updateIndicator = (target: Element) => {
    if (!indicator || !tabRow) return;

    const tagetBounds = target.getBoundingClientRect();
    const rowBounds = tabRow.getBoundingClientRect();

    const height = tagetBounds.height;
    const offset = tagetBounds.top - rowBounds.top;

    gsap.to(indicator, { y: offset, height, duration: 0.4, ease: 'back.out(1)' });
  };

  const handleTagClick = (tagName: string) => {
    store.setSelectedTag(tagName);
    store.setChanging(true);
  };

  return (
    <Card className="tabs max-md:overflow-hidden max-md:py-0 max-md:pt-6">
      <CardHeader className="flex flex-col items-start">
        <CardTitle>태그목록</CardTitle>
      </CardHeader>
      <CardContent className="relative px-2 py-0">
        <SearchButton />
        <div
          className={cn(
            'tabs-row relative mt-3 flex flex-col gap-3 max-md:overflow-y-auto max-md:overscroll-contain',
            expanded
              ? 'max-md:h-auto max-md:overflow-y-auto'
              : 'max-md:h-[50vh] max-md:overflow-hidden'
          )}
        >
          {allTags.map((tag) => {
            const tagInfo = toTagInfo(tag.name);
            const isSelected = selectedTag === tag.name || (!selectedTag && tag.name === '전체');
            return (
              <Link
                href={tag.name === '전체' ? '/' : `?tag=${encodeURIComponent(tag.name)}`}
                key={tag.name}
                onClick={() => {
                  handleTagClick(tag.name);
                  updateIndicator(document.getElementById(tag.name) as Element);
                }}
                prefetch={true}
              >
                <div
                  id={tag.name}
                  className={cn(
                    'hover:bg-muted-foreground/10 text-muted-foreground flex items-center justify-between rounded-md px-4 py-1.5 text-sm transition-colors',
                    isSelected && 'text-primary active font-medium'
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
          <div className="bg-primary/10 indicator absolute h-8 w-full rounded-md"></div>
        </div>
        {!expanded && (
          <div
            className="bg-card pointer-events-none absolute right-0 bottom-0 left-0 z-10 hidden h-16 max-md:block"
            style={{
              WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%) ',
              maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%) ',
            }}
          />
        )}
        <Button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'bg-card/0 bottom-5 left-0 z-20 flex w-full text-center text-base text-white underline shadow-none md:hidden',
            expanded ? 'my-2 block h-10' : 'absolute'
          )}
        >
          {expanded ? '접기' : '더 보기'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TagSection;
