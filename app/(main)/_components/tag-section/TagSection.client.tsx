'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagFilterItem } from '@/lib/types/blog';
import Link from 'next/link';
import React, { use } from 'react';
import { cn } from '@/lib/utils/tailwind-cn';
import SearchButton from '../search/SearchButton';

interface TagSectionProps {
  tags: Promise<TagFilterItem[]>;
  selectedTag?: string;
}

const TagSection = ({ tags, selectedTag }: TagSectionProps) => {
  const allTags = use(tags);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start">
        <CardTitle>태그목록</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <SearchButton />
        <div className="mt-3 flex flex-col gap-3">
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag.name || (!selectedTag && tag.name === '전체');
            return (
              <Link
                href={tag.name === '전체' ? '/' : `?tag=${encodeURIComponent(tag.name)}`}
                key={tag.name}
              >
                <div
                  className={cn(
                    'flex items-center justify-between rounded-md px-4 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted-foreground/10 text-muted-foreground'
                  )}
                >
                  <span>{tag.name}</span>
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
