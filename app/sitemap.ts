import { PostMetadata } from '@/domain/entities/post.entity';
import { diContainer } from '@/shared/di/di-container';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postUseCase = diContainer.post.postUseCase;
  // 기본 URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  // 정적 페이지 목록
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ] as const;

  // 블로그 게시물 가져오기
  const posts = await postUseCase.getAllPublishedPostMetadatas();

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
