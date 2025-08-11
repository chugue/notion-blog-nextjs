import Header from '@/shared/components/layouts/Header';
import { Analytics } from '@vercel/analytics/next';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {/* <Footer /> */}
      <Analytics />
    </div>
  );
}
