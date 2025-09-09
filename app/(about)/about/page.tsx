export const dynamic = 'force-static';

import AboutPageContent from '@/app/(blog)/_components/AboutPageContent';
import TableOfContentsWrapper from '@/app/(blog)/_components/TableOfContentsWrapper';
import AddPageView from '@/app/(main)/_components/AddPageView';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { getDiContainer } from '@/shared/di/di-container';
import { Separator } from '@radix-ui/react-separator';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export default async function About() {
  const aboutPageId = process.env.NEXT_PUBLIC_ABOUT_PAGE_ID!;
  const postUseCase = getDiContainer().post.postUseCase;
  const result = await postUseCase.getAboutPage(aboutPageId);

  if (!result) {
    notFound();
  }

  const { recordMap } = result;

  return (
    <div className="about-page container mx-auto sm:py-12">
      <AddPageView pageId={process.env.NEXT_PUBLIC_ABOUT_PAGE_ID || ''} />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_220px] xl:grid-cols-[250px_1fr_300px]">
        <aside className="hidden xl:block">{/* 추후 컨텐츠 추가 */}</aside>
        <section className="min-w-0 px-4">
          <Separator className="my-6" />

          {/* 블로그 본문 */}
          <div className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-[var(--sticky-top)] max-w-none">
            <Suspense fallback={<LoadingSpinner />}>
              <AboutPageContent recordMap={recordMap} />
            </Suspense>
          </div>
        </section>
        {/* 목차 */}
        <TableOfContentsWrapper className="md:block" />
      </div>
    </div>
  );
}
