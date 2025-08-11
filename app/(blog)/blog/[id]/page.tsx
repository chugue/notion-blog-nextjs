import { Separator } from '@/shared/components/ui/separator';
import { CalendarDays, User, ChevronDown } from 'lucide-react';
import { formatDate } from '@/shared/utils/format-date';
import { MDXContent } from '@/app/(blog)/_components/MdxContent';
import { compile } from '@mdx-js/mdx';
import withSlugs from 'rehype-slug';
import withToc from '@stefanprobst/rehype-extract-toc';
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx';
import rehypeSanitize from 'rehype-sanitize';
import GiscusComments from '@/app/(blog)/_components/GiscusComments';
import TableOfContentsWrapper from '../../_components/TableOfContentsWrapper';
import { diContainer } from '@/shared/di/di-container';
import { Suspense } from 'react';
import LoadingSpinner from '@/shared/components/LoadingSpinner';
import Image from 'next/image';
import ColoredBadge from '../../_components/ColoredBadge';
import getPostDetailPage from '@/presentation/utils/get-post-detail-page';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = await getPostDetailPage(id);

  if (!result || !result.post) {
    return {
      title: "Stephen's 기술블로그 | 개발 공부 및 튜토리얼",
      description: '개발 공부 및 튜토리얼',
      openGraph: {
        images: [{ url: '/images/main-thumbnail.png', width: 1200, height: 630, alt: 'Not Found' }],
      },
      twitter: { images: ['/images/main-thumbnail.png'] },
    };
  }

  const post = result.post;

  return {
    title: post.title,
    description: `${post.title} - Stephen's 기술블로그`,
    keywords: post.tag,
    authors: [{ name: '김성훈', url: 'https://github.com/chugue' }],
    publisher: '김성훈',
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description: `${post.title} - Stephen's 기술블로그`,
      url: `/blog/${post.id}`,
      type: 'article',
      publishedTime: post.date,
      authors: post.author || '김성훈',
      tags: post.tag,
      images: [post.coverImage || '/images/no-image-dark.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: `${post.title} - Stephen's 기술블로그`,
      images: [post.coverImage || '/images/no-image-dark.png'],
    },
  };
}

export const generateStaticParams = async () => {
  const postUseCase = diContainer.post.postUseCase;
  const posts = await postUseCase.getPostsWithParams({
    pageSize: 10,
  });
  return posts.posts.map((post) => ({
    id: post.id,
  }));
};

interface BlogPostProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { id } = await params;

  const { post, markdown } = await getPostDetailPage(id);

  const { data } = await compile(markdown, {
    rehypePlugins: [withSlugs, rehypeSanitize, withToc, withTocExport],
  });

  return (
    <div className="container mx-auto py-6 sm:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_220px] xl:grid-cols-[250px_1fr_300px]">
        <aside className="hidden xl:block">{/* 추후 컨텐츠 추가 */}</aside>
        <section className="min-w-0 px-4">
          {/* 블로그 헤더 */}
          <div className="space-y-4">
            <div className="my-4 space-y-4">
              <h1 className="my-10 text-4xl font-bold sm:text-[3.5rem]">{post.title}</h1>
            </div>

            <div className="relative my-8 aspect-video w-full">
              <Image
                src={post.coverImage || '/public/images/no-image-dark.png'}
                alt={post.title}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* 메타 정보 */}
            <div className="text-muted-foreground flex flex-col gap-4 text-lg">
              <div className="flex flex-wrap gap-2">
                {post.tag.map((tag) => (
                  <ColoredBadge key={tag} tag={tag} />
                ))}
              </div>
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{post.date ? formatDate(post.date) : ''}</span>
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
                <TableOfContentsWrapper toc={data?.toc || []} />
              </nav>
            </details>
          </div>

          {/* 블로그 본문 */}
          <div className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-[var(--sticky-top)] max-w-none">
            <MDXContent source={markdown} pageId={id} />
          </div>

          <Separator className="my-16" />

          {/* 이전/다음 포스트 네비게이션 */}
          {/* <nav className="grid grid-cols-2 gap-8">
            <Link href="/blog/previous-post">
              <Card className="group hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <ChevronLeft className="h-4 w-4" />
                    <span>시작하기</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    Next.js를 시작하는 방법부터 프로젝트 구조, 기본 설정까지 상세히 알아봅니다.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/blog/next-post" className="text-right">
              <Card className="group hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-end gap-2 text-base font-medium">
                    <span>심화 가이드</span>
                    <ChevronRight className="h-4 w-4" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    Next.js의 고급 기능들을 활용하여 더 나은 웹 애플리케이션을 만드는 방법을
                    소개합니다.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </nav> */}
          <Suspense fallback={<LoadingSpinner />}>
            <GiscusComments term={`blog-${id}`} />
          </Suspense>
        </section>

        {/* 목차 */}
        <TableOfContentsWrapper toc={data?.toc || []} />
      </div>
    </div>
  );
}
