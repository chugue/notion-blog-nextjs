import getMainPageData from '@/presentation/utils/get-main-page-data';
import { Suspense } from 'react';
import HeaderSection from './_components/HeaderSection';
import { VisitStats } from './_components/VisitStats';
import { FlipHexTechStack } from './_components/hex-tech/FlipHexTechStack';
import PostListSkeleton from './_components/post-list/PostListSkeleton';
import PostListSuspense from './_components/post-list/PostListSuspense';
import TagSection from './_components/tag-section/TagSection';
import TagSectionSkeleton from './_components/tag-section/TagSectionSkeleton';

interface HomeProps {
  searchParams: Promise<{
    tag?: string;
    sort?: string;
  }>;
  request: Request;
}

export default async function Home({ searchParams }: HomeProps) {
  const { tag, sort } = await searchParams;
  const selectedTag = tag ?? '전체';
  const selectedSort = sort ?? 'latest';

  const { tags, postsPromise } = await getMainPageData({ selectedTag, selectedSort });

  return (
    <div className="container mx-auto py-5 sm:py-8">
      <section className="mb-6 grid grid-cols-[500px_1fr] max-lg:grid-cols-1 max-md:px-4">
        <VisitStats />
        <FlipHexTechStack tags={tags} />
      </section>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[250px_1fr]">
        {/* 좌측 사이드바 */}
        <aside className="order-2 min-w-2xs max-md:w-full max-md:justify-self-center max-md:px-4 md:order-none">
          <Suspense fallback={<TagSectionSkeleton />}>
            <TagSection tags={tags} />
          </Suspense>
        </aside>

        <div className="order-3 space-y-8 max-md:mx-auto max-md:max-w-[476px] max-md:min-w-[286px] max-md:px-4 md:order-none md:ml-10 md:w-full">
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
