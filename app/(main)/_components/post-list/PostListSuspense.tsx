'use client';

import Link from 'next/link';
import React, { use, useEffect } from 'react';
import { PostCard } from './PostCard';
import { Loader2 } from 'lucide-react';
import { PostMetadataResp } from '@/domain/entities/post.entity';
import { useFetchPost } from '@/presentation/hooks/blog/use-fetch-post';
import { useInfiniteScroll } from '@/presentation/hooks/blog/use-infinite-scroll';
import { useCheckSelectedTag } from '@/presentation/hooks/blog/use-check-selected-tag';

interface PostListProps {
  postsPromise: Promise<PostMetadataResp>;
}

const PostListSuspense = ({ postsPromise }: PostListProps) => {
  const initialData = use(postsPromise);

  const { data, isError, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, tag } =
    useFetchPost(initialData);
  const { ref } = useInfiniteScroll(hasNextPage, isFetchingNextPage, fetchNextPage);
  const { isChanging } = useCheckSelectedTag(isFetching);

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
      <div className={`responsive-grid relative ${isChanging ? 'opacity-50' : ''}`}>
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
