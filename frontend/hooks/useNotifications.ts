import { useState, useEffect } from "react";

export interface Notification {
  id: string;
  type: "alert" | "strategy" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  asset?: string;
  severity: "high" | "medium" | "low";
}

const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "alert",
    title: "Health Factor Warning",
    message: "ETH liquidation risk detected. Consider adding collateral.",
    timestamp: Date.now() - 1000 * 60 * 5,
    read: false,
    asset: "eth",
    severity: "high",
  },
  {
    id: "notif-002",
    type: "strategy",
    title: "Rebalancing Executed",
    message: "USDC strategy rebalanced successfully. APY optimized to 4.52%.",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
    asset: "usdc",
    severity: "medium",
  },
  {
    id: "notif-003",
    type: "strategy",
    title: "Strategy Completed",
    message: "SGHO strategy completed. Total yield earned: $1,240.50.",
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    read: false,
    asset: "sgho",
    severity: "medium",
  },
  {
    id: "notif-004",
    type: "system",
    title: "Gas Price Spike",
    message: "Network congestion detected. Gas price is 3x above average.",
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    read: true,
    severity: "low",
  },
  {
    id: "notif-005",
    type: "alert",
    title: "Price Alert",
    message: "ETH dropped 8.5% in the last hour. Strategy adjusting...",
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    read: true,
    asset: "eth",
    severity: "high",
  },
];

const STORAGE_KEY = "dolfin_notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      // First time → load mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockNotifications));
      setNotifications(mockNotifications);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
