"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Vault, History, Settings, Bell, Bot } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import LogoDolfin from "@/components/shared/LogoDolfin";

export default function Sidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Agents", href: "/agents", icon: Bot },
    // { name: "Vaults", href: "/vaults", icon: Vault },
    // { name: "History", href: "/history", icon: History },
    // { name: "Notifications", href: "/notifications", icon: Bell },
    // { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-black border-r border-[#262626] flex flex-col p-8 sticky top-0">
      {/* Logo */}
      <Link href="/dashboard" className="group mb-16 border-b border-[#262626] pb-8 flex items-center gap-3">
        <LogoDolfin size={36} />
        <h2 className="text-brand-gradient text-2xl font-normal uppercase tracking-[4px]">
          Dolfin
        </h2>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col space-y-8">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

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
                    ? "bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.9)]"
                    : "bg-transparent"
                }`}
              />

              {/* Icon + Badge */}
              <div className="relative">
                <item.icon
                  size={isActive ? 22 : 20}
                  strokeWidth={isActive ? 1.5 : 1}
                />
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-mono text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              <span
                className={isActive ? "translate-x-1 transition-transform" : ""}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
