import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagFilterItem } from '@/types/blog';
import Link from 'next/link';
import React from 'react';

interface TagSectionProps {
  tags: TagFilterItem[];
}

const TagSection = ({ tags }: TagSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>태그목록</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {tags.map((tag) => (
            <Link href={`?tag=${tag.name}`} key={tag.name}>
              <div className="hover:bg-muted-foreground/10 text-muted-foreground flex items-center justify-between p-1.5">
                <span>{tag.name}</span>
                <span>{tag.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagSection;
