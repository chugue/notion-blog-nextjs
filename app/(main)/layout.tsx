import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import TanstackProvider from '../../components/providers/TanstackProvider';

const maplestory = localFont({
  src: [
    {
      path: '../../public/font/Maplestory OTF Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/font/Maplestory OTF Bold.otf',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${maplestory.variable} antialiased`} suppressHydrationWarning={true}>
        <TanstackProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
