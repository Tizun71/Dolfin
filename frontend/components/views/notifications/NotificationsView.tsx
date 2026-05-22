"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const severityConfig = {
  high: { dot: "bg-red-500", label: "text-red-500" },
  medium: { dot: "bg-yellow-500", label: "text-yellow-500" },
  low: { dot: "bg-[#555]", label: "text-[#555]" },
};

const typeConfig = {
  alert: { label: "Alert" },
  strategy: { label: "Strategy" },
  system: { label: "System" },
};

const assetConfig: Record<string, { icon: string; color: string }> = {
  eth: { icon: "Ξ", color: "#627EEA" },
  sgho: { icon: "◎", color: "#22c55e" },
  usdc: { icon: "$", color: "#2775CA" },
  usdt: { icon: "₮", color: "#26A17B" },
  wbtc: { icon: "B", color: "#F7931A" },
  wsteth: { icon: "◆", color: "#9B59B6" },
  weeth: { icon: "◆", color: "#00A3FF" },
};

type FilterType = "all" | "alert" | "strategy" | "system";

export default function NotificationsView() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<FilterType>("all");

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Alerts", value: "alert" },
    { label: "Strategy", value: "strategy" },
    { label: "System", value: "system" },
  ];

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-normal uppercase tracking-[4px] text-white mb-2">
            Notifications
          </h1>
          <p className="text-[#444] text-xs font-mono uppercase tracking-[2px]">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-xs font-mono uppercase tracking-[2px] border border-[#333] text-[#666] hover:border-white hover:text-white transition-all duration-300"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 border-b border-[#1a1a1a] pb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-[2px] transition-all duration-300 border ${
              filter === f.value
                ? "border-white text-white bg-white/5"
                : "border-[#1a1a1a] text-[#444] hover:text-[#999] hover:border-[#333]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="border border-[#1a1a1a] bg-[#050505] p-16 text-center">
            <p className="text-[#444] text-xs font-mono uppercase tracking-[3px]">
              No notifications
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const severity = severityConfig[notif.severity];
            const asset = notif.asset ? assetConfig[notif.asset] : null;

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`border bg-[#050505] px-6 py-5 flex items-start gap-5 cursor-pointer transition-all duration-300 hover:border-[#2a2a2a] ${
                  notif.read ? "border-[#111] opacity-50" : "border-[#1a1a1a]"
                }`}
              >
                {/* Severity dot */}
                <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${severity.dot}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Asset icon */}
                    {asset && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs border shrink-0"
                        style={{
                          borderColor: `${asset.color}44`,
                          color: asset.color,
                        }}
                      >
                        {asset.icon}
                      </div>
                    )}
                    <p className="text-white text-sm font-light tracking-wider">
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <p className="text-[#555] text-xs font-mono leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-[#333] text-xs font-mono uppercase tracking-[2px]">
                      {typeConfig[notif.type].label}
                    </span>
                    <span className="text-[#222] text-xs font-mono">·</span>
                    <span className="text-[#333] text-xs font-mono">
                      {timeAgo(notif.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
