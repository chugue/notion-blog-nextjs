import { MetadataRoute } from 'next';

export default function Robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/*', '/_static/*', '/.vercel/*'],
    },
    sitemap: 'https://notion-blog-nextjs-brown.vercel.app/sitemap.xml',
  };
}
