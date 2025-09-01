export const dynamicParams = true;

import GiscusComments from '@/app/(blog)/_components/GiscusComments';
import AddPageView from '@/app/(main)/_components/AddPageView';
import getPostDetailPage from '@/presentation/utils/get-post-detail-page';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { Separator } from '@/shared/components/ui/separator';
import { diContainer } from '@/shared/di/di-container';
import { formatDate } from '@/shared/utils/format-date';
import { CalendarDays, User } from 'lucide-react';
import Image from 'next/image';
import { Suspense } from 'react';
import ColoredBadge from '../../_components/ColoredBadge';
import MobileToc from '../../_components/MobileToc';
import NotionPageContent from '../../_components/NotionPageContent';
import TableOfContentsWrapper from '../../_components/TableOfContentsWrapper';

export async function generateStaticParams() {
  const postUseCase = diContainer.post.postUseCase;
  const result = await postUseCase.getAllPublishedPostMetadatas();

  return result.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getPostDetailPage(id);

  if (!result.properties) {
    return {
      title: "Stephen's 기술블로그 | 개발 공부 및 튜토리얼",
      description: '개발 공부 및 튜토리얼',
      openGraph: {
        images: [{ url: '/images/main-thumbnail.png', width: 1200, height: 630, alt: 'Not Found' }],
      },
      twitter: { images: ['/images/main-thumbnail.png'] },
    };
  }

  const post = result.properties;
  return {
    title: post.title,
    description: `${post.title} - Stephen's 기술블로그`,
    keywords: post.tag,
    authors: [{ name: '김성훈', url: 'https://github.com/chugue' }],
    publisher: '김성훈',
    alternates: { canonical: `/blog/${post.id}` },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      title: post.title,
      description: `${post.title} - Stephen's 기술블로그`,
      url: `/blog/${post.id}`,
      type: 'article',
      publishedTime: post.date,
      authors: post.author || '김성훈',
      tags: post.tag,
      images: [
        {
          url: post.coverImage || '/images/no-image-dark.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: `${post.title} - Stephen's 기술블로그`,
      images: [post.coverImage || '/images/no-image-dark.png'],
    },
  };
}

interface BlogPostProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { id } = await params;

  try {
    const { properties } = await getPostDetailPage(id);

    return (
      <div className="container mx-auto py-6 sm:py-12">
        <AddPageView pageId={id} />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_220px] xl:grid-cols-[250px_1fr_300px]">
          <aside className="hidden xl:block">{/* 추후 컨텐츠 추가 */}</aside>
          <section className="min-w-0 px-4">
            {/* 블로그 헤더 */}
            <div className="space-y-4">
              <div className="my-4 space-y-4">
                <h1 className="my-10 text-5xl font-bold">{properties?.title}</h1>
              </div>

              <div className="relative my-8 aspect-video w-full">
                <Image
                  src={properties?.coverImage || '/images/no-image-dark.png'}
                  alt={properties?.title || ''}
                  fill
                  className="rounded-lg object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* 메타 정보 */}
              <div className="text-muted-foreground flex flex-col gap-4 text-lg">
                <div className="flex flex-wrap gap-2">
                  {properties?.tag.map((tag: string) => (
                    <ColoredBadge key={tag} tag={tag} />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{properties?.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span>{properties?.date ? formatDate(properties?.date) : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 모바일 블로그 목차 */}
            <MobileToc />

            {/* 블로그 본문 */}
            <div className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-[var(--sticky-top)] max-w-none">
              <NotionPageContent pageId={id} />
            </div>

            <Separator className="my-16" />
            <Suspense fallback={<LoadingSpinner />}>
              <GiscusComments term={`blog-${id}`} />
            </Suspense>
          </section>

          {/* 목차 */}
          <TableOfContentsWrapper className="md:block" />
        </div>
      </div>
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}
