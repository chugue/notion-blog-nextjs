import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PostListSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      <div className="responsive-grid relative">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card
            key={index}
            className="group bg-background relative flex h-full w-full min-w-[280px] flex-col overflow-visible border-none py-0 backdrop-blur-sm transition-transform duration-300"
          >
            <div className="relative aspect-[16/9] flex-shrink-0">
              <Skeleton className="h-full w-full rounded-md" />
            </div>

            <CardContent className="relative my-0 flex flex-1 flex-col px-0 py-0">
              <div className="flex flex-col px-2 transition-opacity duration-300 group-hover:opacity-0">
                <div className="mb-4 flex flex-wrap gap-2">
                  {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, tagIndex) => (
                    <Skeleton
                      key={tagIndex}
                      className="h-5 rounded-full"
                      style={{ width: `${40 + Math.random() * 30}px` }}
                    />
                  ))}
                </div>

                {/* 👈 실제 PostCard와 동일한 제목 구조 */}
                <div className="mb-2 min-h-[3.5rem]">
                  <Skeleton className="mb-1 h-6 w-full" />
                  <Skeleton className="h-6" style={{ width: `${60 + Math.random() * 40}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostListSkeleton;
