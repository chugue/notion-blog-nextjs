import type { NextConfig } from 'next';

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
      {
        hostname: 'localhost',
        port: '3000',
      },
      {
        hostname: 'notion-blog-nextjs-brown.vercel.app',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  pageExtensions: ['ts', 'tsx', 'mdx', 'js', 'jsx', 'md'],
  reactStrictMode: true,
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
  headers: async () => {
    return [
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
