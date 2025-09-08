import '@/app/globals.css';
import TanstackProvider from '@/presentation/providers/TanstackProvider';
import { ThemeProvider } from '@/presentation/providers/ThemeProvider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import { Toaster } from 'sonner';

const maplestory = localFont({
  src: [
    {
      path: '../public/font/Maplestory OTF Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/font/Maplestory OTF Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-maplestory',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `Stephen's 기술블로그| 개발 공부 및 튜토리얼`,
  description: '개발과 관련된 다양한 지식과 경험을 공유하는 블로그입니다.',
  keywords: [
    'Next.js',
    '프론트엔드',
    '웹개발',
    '코딩',
    '프로그래밍',
    'NestJS',
    'React',
    'TypeScript',
  ],
  authors: [{ name: 'Stephen', url: 'https://github.com/chugue' }],
  creator: '김성훈',
  publisher: '김성훈',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}`),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: `Stephen's 기술블로그 | 개발 공부 및 튜토리얼`,
    description: '개발과 관련된 다양한 지식과 경험을 공유하는 블로그입니다.',
    siteName: "Stephen's 기술블로그",
    images: [
      {
        url: '/images/main-thumbnail.png',
        width: 1200,
        height: 630,
        alt: "Stephen's 기술블로그 대표 이미지",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Stephen's 기술블로그| 개발 공부 및 튜토리얼`,
    description: '개발과 관련된 다양한 지식과 경험을 공유하는 블로그입니다.',
    images: ['/images/main-thumbnail.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${maplestory.variable} scroll-smooth p-0 antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning={true} className="overflow-x-hidden">
        <TanstackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}

            <Toaster richColors />
          </ThemeProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
