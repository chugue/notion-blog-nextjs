import Header from '@/shared/components/layouts/Header';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="about-page">
      <Header className="bg-transparent" />
      <div className="min-w-0 flex-1 items-center justify-center">{children}</div>
    </main>
  );
}
