import Sidebar from "@/components/Sidebar";
import Header from "@/components/views/header/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto mt-14">
          <div className="w-full px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
