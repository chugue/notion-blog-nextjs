import GiscusComments from '@/app/(blog)/_components/GiscusComments';
import getPostDetailPage from '@/presentation/utils/get-post-detail-page';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import { Separator } from '@/shared/components/ui/separator';
import { formatDate } from '@/shared/utils/format-date';
import { CalendarDays, ChevronDown, User } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ColoredBadge from '../../_components/ColoredBadge';
import NotionPageContent from '../../_components/NotionPageContent';

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
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    // robots 태그 추가
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
      // 이미지 정보를 객체로 제공
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

  const { properties, recordMap } = await getPostDetailPage(id);

  if (!properties) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: properties.title,
    description: `${properties.title} - Stephen's 기술블로그`,
    image: properties.coverImage || '/images/no-image-dark.png',
    author: {
      '@type': 'Person',
      name: properties.author || '김성훈',
      url: 'https://github.com/chugue',
    },
    publisher: {
      '@type': 'Organization',
      name: "Stephen's 기술블로그",
      logo: {
        '@type': 'ImageObject',
        url: '/images/main-thumbnail.png', // 블로그 로고 이미지
      },
    },
    datePublished: properties.date,
    dateModified: properties.date, // 수정 날짜가 있다면 해당 필드를 사용
  };

  return (
    <div className="container mx-auto py-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_220px] xl:grid-cols-[250px_1fr_300px]">
        <aside className="hidden xl:block">{/* 추후 컨텐츠 추가 */}</aside>
        <section className="min-w-0 px-4">
          {/* 블로그 헤더 */}
          <div className="space-y-4">
            <div className="my-4 space-y-4">
              <h1 className="my-10 text-4xl font-bold sm:text-[3.5rem]">{properties.title}</h1>
            </div>

            <div className="relative my-8 aspect-video w-full">
              <Image
                src={properties.coverImage || '/images/no-image-dark.png'}
                alt={properties.title}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* 메타 정보 */}
            <div className="text-muted-foreground flex flex-col gap-4 text-lg">
              <div className="flex flex-wrap gap-2">
                {properties.tag.map((tag) => (
                  <ColoredBadge key={tag} tag={tag} />
                ))}
              </div>
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{properties.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{properties.date ? formatDate(properties.date) : ''}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* 모바일 블로그 목차 */}
          <div className="mb-6 md:hidden">
            <details className="bg-muted/60 group rounded-lg p-4 backdrop-blur-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold transition-all duration-300 ease-out [&::-webkit-details-marker]:hidden">
                목차
                <ChevronDown
                  className="h-5 w-5 transition-transform duration-300 ease-out group-open:rotate-180"
                  strokeWidth={3}
                />
              </summary>
              <nav className="mt-3 space-y-3 text-sm">
                {/* <TableOfContentsWrapper toc={data?.toc || []} /> */}
              </nav>
            </details>
          </div>

          {/* 블로그 본문 */}
          <div className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-[var(--sticky-top)] max-w-none">
            <NotionPageContent recordMap={recordMap} />
          </div>

          <Separator className="my-16" />
          <Suspense fallback={<LoadingSpinner />}>
            <GiscusComments term={`blog-${id}`} />
          </Suspense>
        </section>

        {/* 목차 */}
        {/* <TableOfContentsWrapper toc={data?.toc || []} /> */}
      </div>
    </div>
  );
}
