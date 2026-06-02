"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function WalletSection() {
  const { user, authenticated } = usePrivy();

  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-8">
      {/* Header */}
      <h2 className="text-sm font-mono uppercase tracking-[2px] text-[#999] mb-8 border-b border-[#222] pb-4 font-semibold">
        Wallet Info
      </h2>

      {authenticated && user ? (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-3 font-medium">
              Wallet Address
            </p>
            <p className="text-[#f0f0f0] text-base font-mono truncate font-medium">
              {user.wallet?.address ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-3 font-medium">
              Network
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-[#f0f0f0] text-base font-mono font-medium">
                Arbitrum One
              </p>
            </div>
          </div>
          <div>
            <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-3 font-medium">
              Connection Status
            </p>
            <div className="flex items-center gap-2 px-4 py-2 border border-green-600 bg-green-600/15 w-fit rounded-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-sm uppercase tracking-[2px] font-mono font-medium">
                Connected
              </span>
            </div>
          </div>
          <div>
            <p className="text-[#888] text-xs font-mono uppercase tracking-[1.5px] mb-3 font-medium">
              Wallet Type
            </p>
            <p className="text-[#f0f0f0] text-base font-mono capitalize font-medium">
              {user.wallet?.walletClientType ?? "—"}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[#888] text-sm font-mono uppercase tracking-[2px] font-medium">
            No wallet connected
          </p>
        </div>
      )}
    </div>
  );
}
