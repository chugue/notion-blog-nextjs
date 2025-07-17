'use client';

import Link from 'next/link';
import React, { use } from 'react';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/button';
import { GetPublishedPostResponse } from '@/lib/notion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

interface PostListProps {
  postsPromise: Promise<GetPublishedPostResponse>;
}

const PostListSuspense = ({ postsPromise }: PostListProps) => {
  const searchParams = useSearchParams();
  const initialData = use(postsPromise);

  const tag = searchParams.get('tag') || '전체';
  const sort = searchParams.get('sort') || 'latest';

  const fetchPost = async ({
    pageParam,
  }: {
    pageParam?: string;
  }): Promise<GetPublishedPostResponse> => {
    const params = new URLSearchParams();

    if (tag && tag !== '전체') params.append('tag', tag);
    if (sort && sort !== 'latest') params.append('sort', sort);
    if (pageParam) params.append('startCursor', pageParam);
    params.append('pageSize', '2');

    const response = await fetch(`/api/posts?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, error } = useInfiniteQuery(
    {
      queryKey: ['posts', tag, sort],
      queryFn: fetchPost,
      initialPageParam: initialData.nextCursor,
      initialData: {
        pages: [initialData],
        pageParams: [undefined],
      },
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      staleTime: 5 * 60 * 1000,
    }
  );

  // 에러 상태
  if (isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive text-lg">포스트를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {error instanceof Error ? error.message : '알 수 없는 오류'}
        </p>
      </div>
    );
  }

  // 모든 페이지의 포스트를 하나의 배열로 합치기
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {allPosts.length > 0 ? (
          allPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <PostCard post={post} isFirst={index === 0} />
            </Link>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg">
              {tag
                ? `'${tag}' 태그에 해당하는 포스트가 없습니다.`
                : '아직 발행된 포스트가 없습니다.'}
            </p>
          </div>
        )}
      </div>

      {/* 더보기 버튼 */}
      {hasNextPage && (
        <div>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? '로딩 중...' : '더보기'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostListSuspense;
