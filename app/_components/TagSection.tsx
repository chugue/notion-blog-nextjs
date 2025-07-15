import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagFilterItem } from '@/types/blog';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';

interface TagSectionProps {
  tags: TagFilterItem[];
  selectedTag?: string; // 👈 선택된 태그 prop 추가
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
                      ? 'bg-primary/10 text-primary font-medium' // 👈 선택된 태그 스타일
                      : 'hover:bg-muted-foreground/10 text-muted-foreground' // 👈 기본 태그 스타일
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
