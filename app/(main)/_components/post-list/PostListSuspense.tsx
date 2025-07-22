'use client';

import Link from 'next/link';
import React, { use, useEffect } from 'react';
import { PostCard } from './PostCard';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { GetPublishedPostResponse } from '@/lib/types/notion';

interface PostListProps {
  postsPromise: Promise<GetPublishedPostResponse>;
}

const PostListSuspense = ({ postsPromise }: PostListProps) => {
  const searchParams = useSearchParams();
  const initialData = use(postsPromise);
  const tag = searchParams.get('tag') || '전체';
  const sort = searchParams.get('sort') || 'latest';

  // 무한 스크롤 라이브러리
  const { ref, inView } = useInView({
    threshold: 1,
  });

  const fetchPost = async ({
    pageParam,
  }: {
    pageParam?: string;
  }): Promise<GetPublishedPostResponse> => {
    const params = new URLSearchParams();

    if (tag && tag !== '전체') params.append('tag', tag);
    if (sort && sort !== 'latest') params.append('sort', sort);
    if (pageParam) params.append('startCursor', pageParam);

    params.append('pageSize', '10');

    const response = await fetch(`/api/notion?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  };

  const { data, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    {
      queryKey: ['posts', tag, sort],
      queryFn: fetchPost,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      initialData: {
        pages: [initialData],
        pageParams: [undefined],
      },
    }
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView]);

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

  // 하나의 배열로 합치기
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className="space-y-6">
      <div className="responsive-grid relative">
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

      {hasNextPage && !isFetchingNextPage && <div ref={ref} className="h-10"></div>}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          <span className="text-muted-foreground text-sm">로딩 중...</span>
        </div>
      )}
    </div>
  );
};

export default PostListSuspense;
