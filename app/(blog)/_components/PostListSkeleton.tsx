import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const PostListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 transition-all md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className="group bg-card/50 border-border/40 flex h-full flex-col overflow-hidden border py-0 backdrop-blur-sm"
        >
          {/* 커버 이미지 스켈레톤 */}
          <div className="relative aspect-[16/9] flex-shrink-0 overflow-hidden">
            <Skeleton className="h-full w-full" />
          </div>

          <CardContent className="flex flex-1 flex-col px-2">
            {/* 태그 배지 스켈레톤 */}
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, tagIndex) => (
                <Skeleton
                  key={tagIndex}
                  className="h-5 rounded-full"
                  style={{ width: `${40 + Math.random() * 30}px` }} // 👈 다양한 태그 길이
                />
              ))}
            </div>

            {/* 제목 스켈레톤 */}
            <Skeleton className="mb-2 h-7 w-full" />
            <Skeleton
              className="mb-2 h-7"
              style={{ width: `${60 + Math.random() * 40}%` }} // 👈 다양한 제목 길이
            />

            {/* 메타 정보 스켈레톤 */}
            <div className="mt-6 flex items-center gap-x-4">
              {/* 작성자 */}
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4" /> {/* User 아이콘 */}
                <Skeleton className="h-4 w-16" />
              </div>
              {/* 날짜 */}
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-4 w-4" /> {/* Calendar 아이콘 */}
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostListSkeleton;
