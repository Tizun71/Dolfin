"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BotMessageSquare,
  ChartArea,
  Vault,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Intelligence Console", href: "/chat", icon: BotMessageSquare },
    { name: "AI Insights", href: "/aiinsights", icon: ChartArea },
    { name: "Vaults", href: "/vaults", icon: Vault },
  ];

  return (
    <aside className="w-64 h-screen bg-black border-r border-[#262626] flex flex-col p-8 sticky top-0">
      {/* Logo */}
      <div className="mb-16 border-b border-[#262626] pb-8">
        <h2 className="text-white text-2xl font-normal uppercase tracking-[4px]">
          Dolfin
        </h2>
      </div>

      {/* Điều hướng (Navigation) */}
      <nav className="flex flex-col space-y-8">
        {navigation.map((item) => {
          // Kiểm tra xem mục này có đang được chọn hay không
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[11px] font-mono uppercase tracking-[2px] flex items-center gap-3 transition-all duration-300 ${
                isActive ? "text-white" : "text-[#666666] hover:text-[#999999]"
              }`}
            >
              <span
                className={`w-1 h-1 rounded-full transition-all duration-500 ${
                  isActive
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    : "bg-transparent group-hover:bg-[#3a3a3a]"
                }`}
              ></span>

              <item.icon
                size={isActive ? 22 : 20}
                strokeWidth={isActive ? 1.5 : 1}
              />

              <span
                className={isActive ? "translate-x-1 transition-transform" : ""}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div className="mt-auto pt-8 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-6">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="text-[#3a3a3a] text-[13px] font-mono uppercase tracking-[2px]">
            System Core v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
