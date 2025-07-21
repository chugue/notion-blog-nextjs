import HeaderSection from './_components/HeaderSection';
import { Suspense } from 'react';
import PostListSuspense from '@/app/(blog)/_components/PostListSuspense';
import PostListSkeleton from '@/app/(blog)/_components/PostListSkeleton';
import TagSectionSkeleton from './_components/TagSectionSkeleton';
import TagSectionClient from './_components/TagSection.client';
import { getPublishedPosts, getTags } from '@/lib/services/notion';
import SearchButton from './_components/SearchButton';

interface HomeProps {
  searchParams: Promise<{
    tag?: string;
    sort?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { tag, sort } = await searchParams;
  const selectedTag = tag ?? '전체';
  const selectedSort = sort ?? 'latest';

  const tags = getTags();
  const postsPromise = getPublishedPosts({
    tag: selectedTag,
    sort: selectedSort,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-20 md:grid-cols-[250px_1fr]">
        {/* 좌측 사이드바 */}
        <aside className="order-2 min-w-2xs max-md:w-full max-md:justify-self-center md:order-none">
          {/* 검색버튼 (md 이상에서만) */}
          <Suspense fallback={<TagSectionSkeleton />}>
            <TagSectionClient tags={tags} selectedTag={selectedTag} />
          </Suspense>
        </aside>

        <div className="order-3 space-y-8 max-md:mx-auto max-md:max-w-[476px] max-md:min-w-[286px] md:order-none md:justify-self-end">
          {/* 섹션 제목 */}
          <HeaderSection selectedTag={selectedTag} />

          {/* 블로그 카드 그리드 */}
          <Suspense fallback={<PostListSkeleton />}>
            <PostListSuspense postsPromise={postsPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
