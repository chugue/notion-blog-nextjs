import Header from '@/shared/components/layouts/Header';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="about-page min-w-0 flex-1 items-center justify-center">{children}</main>
    </>
  );
}
