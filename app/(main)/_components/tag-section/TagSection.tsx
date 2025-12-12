'use client';

import { TagFilterItem } from '@/domain/entities/post.entity';
import { useSyncSelectedTag } from '@/presentation/hooks/use-sync-selected-tag';
import {
  selectActiveTag,
  useSelectedTagStore,
} from '@/presentation/stores/use-selected-tag.store';
import { toTagInfo } from '@/presentation/utils/to-tag-Info';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/tailwind-cn';
import gsap from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SearchButton from '../search/SearchButton';

export interface TagSectionProps {
  tags: TagFilterItem[];
  selectedTag: string;
}

const TagSection = ({ tags, selectedTag }: TagSectionProps) => {
  const activeTag = useSelectedTagStore(selectActiveTag);
  const setOptimisticTag = useSelectedTagStore((state) => state.setOptimisticTag);
  const setChanging = useSelectedTagStore((state) => state.setChanging);
  const [expanded, setExpanded] = useState(false);

  // 서버에서 받은 selectedTag를 store에 동기화
  useSyncSelectedTag(selectedTag);

  const updateIndicator = (tagName: string, animate = true) => {
    const target = document.getElementById(tagName);
    const indicator = document.querySelector('.indicator');
    const tabRow = document.querySelector('.tabs-row');

    if (!target || !indicator || !tabRow) return;

    const targetBounds = target.getBoundingClientRect();
    const rowBounds = tabRow.getBoundingClientRect();

    const offset = targetBounds.top - rowBounds.top;

    if (animate) {
      gsap.to(indicator, { y: offset, duration: 0.4, ease: 'back.out(1)' });
    } else {
      gsap.set(indicator, { y: offset });
    }
  };

  // activeTag 변경 시 indicator 위치 동기화
  useEffect(() => {
    const tagName = activeTag || '전체';
    // 초기 렌더링 시에는 애니메이션 없이, 이후에는 애니메이션과 함께
    const isInitial = !document.querySelector('.indicator')?.hasAttribute('data-initialized');

    // DOM이 준비된 후 실행
    requestAnimationFrame(() => {
      updateIndicator(tagName, !isInitial);
      document.querySelector('.indicator')?.setAttribute('data-initialized', 'true');
    });
  }, [activeTag]);

  const handleTagClick = (tagName: string) => {
    setOptimisticTag(tagName);
    setChanging(true);
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
          {tags.map((tag) => {
            const tagInfo = toTagInfo(tag.name);
            const isSelected = activeTag === tag.name || (!activeTag && tag.name === '전체');
            return (
              <Link
                href={tag.name === '전체' ? '/' : `?tag=${encodeURIComponent(tag.name)}`}
                key={tag.name}
                onClick={() => {
                  handleTagClick(tag.name);
                  updateIndicator(tag.name);
                }}
                prefetch={true}
                scroll={false}
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
            'bg-card/0 hover:bg-card/0 bottom-5 left-0 z-20 flex w-full text-center text-base text-white underline shadow-none md:hidden',
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
