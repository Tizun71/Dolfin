import Header from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto mt-16">
        <div className="w-full max-w-[1600px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
