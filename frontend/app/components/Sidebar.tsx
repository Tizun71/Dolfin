"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4 flex flex-col fixed">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <h1 className="text-2xl font-bold">Dolfin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <Link
          href="/"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive("/") ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-300"
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/chat"
          className={`block px-4 py-2 rounded-lg transition ${
            isActive("/chat") ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-300"
          }`}
        >
          Chat
        </Link>
      </nav>

      {/* Connect Wallet */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
        Connect Wallet
      </button>
    </div>
  );
}