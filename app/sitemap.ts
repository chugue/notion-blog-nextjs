import { MetadataRoute } from 'next';
import { PostMetadata } from '@/domain/entities/post.entity';
import { getPublishedPosts } from '@/shared/services/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 기본 URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://notion-blog-nextjs-brown.vercel.app';

  // 정적 페이지 목록
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ] as const;

  // 블로그 게시물 가져오기
  const { posts } = await getPublishedPosts({ pageSize: 100 });

  // 블로그 게시물 URL 생성
  const blogPosts = posts.map((post: PostMetadata) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 정적 페이지와 블로그 게시물 결합
  return [...staticPages, ...blogPosts];
}
