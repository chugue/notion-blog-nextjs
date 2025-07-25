import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'picsum.photos',
      },
      {
        hostname: 'images.unsplash.com',
      },
      {
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
      {
        hostname: 'www.w3.org',
      },
      {
        hostname: 'www.notion.so',
      },
    ],
    // 👈 Notion 이미지 처리를 위한 추가 설정
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  pageExtensions: ['ts', 'tsx', 'mdx', 'js', 'jsx', 'md'],
  reactStrictMode: true,
  // CSS 최적화 비활성화로 빌드 에러 해결
  experimental: {
    optimizeCss: false,
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // CSS 최소화 비활성화
    if (!isServer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer: any) => !minimizer.constructor.name.includes('CssMinimizerPlugin')
      );
    }
    return config;
  },
};

const withMDX = createMDX({
  // 여기서 필요한 마크다운 플러그인을 추가할 수 있음
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSanitize],
  },
});

export default withMDX(nextConfig);
