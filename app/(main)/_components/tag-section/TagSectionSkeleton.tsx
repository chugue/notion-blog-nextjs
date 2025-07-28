import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

const TagSectionSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-20" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div className="flex flex-col gap-3">
          {/* 여러 태그 아이템 스켈레톤 */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between rounded-md px-4 py-1.5">
              <Skeleton
                className="h-4"
                style={{ width: `${60 + Math.random() * 40}px` }} // 👈 다양한 길이
              />
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagSectionSkeleton;
