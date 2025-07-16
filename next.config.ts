import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

console.log('process.env.NODE_ENV', process.env.NODE_ENV);
console.log('process.env.NODE_NAME', process.env.NODE_NAME);

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
    ],
  },
  pageExtensions: ['ts', 'tsx', 'mdx', 'js', 'jsx', 'md'],
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
