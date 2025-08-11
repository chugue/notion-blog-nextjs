export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-w-0 flex-1 items-center justify-center">
      <div className="bg-card text-card-foreground rounded-xl border p-8 shadow-sm">{children}</div>
    </main>
  );
}
