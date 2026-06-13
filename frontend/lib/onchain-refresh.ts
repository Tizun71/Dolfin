"use client";

// Tiny event bus so on-chain reads (balances, Aave position) can refresh on demand without
// prop-drilling. Hooks poll every 5s on their own; a deposit/withdraw fires this to refetch
// immediately instead of waiting for the next tick.
import { useEffect } from "react";

const EVENT = "dolfin:onchain-refresh";

// Auto-refresh interval (ms) for on-chain reads in the agent detail view.
export const ONCHAIN_POLL_MS = 5000;

export function emitOnchainRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

// Run `cb` whenever an on-chain refresh is requested. Stable callbacks recommended.
export function useOnchainRefresh(cb: () => void): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener(EVENT, cb);
    return () => window.removeEventListener(EVENT, cb);
  }, [cb]);
}
