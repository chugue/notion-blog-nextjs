import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TagFilterItem } from '@/shared/types/blog';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/shared/utils/tailwind-cn';

interface TagSectionProps {
  tags: TagFilterItem[];
  selectedTag?: string;
}

const TagSection = ({ tags, selectedTag }: TagSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>태그목록</CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div className="flex flex-col gap-3">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.name || (!selectedTag && tag.name === '전체');
            return (
              <Link
                href={tag.name === '전체' ? '/' : `?tag=${encodeURIComponent(tag.name)}`}
                key={tag.name}
              >
                <div
                  className={cn(
                    'flex items-center justify-between rounded-md px-4 py-1.5 transition-colors',
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
