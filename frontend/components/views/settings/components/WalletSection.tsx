"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function WalletSection() {
  const { user, authenticated } = usePrivy();

  return (
    <div className="border border-[#1a1a1a] bg-[#050505] p-8">
      {/* Header */}
      <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] mb-8 border-b border-[#1a1a1a] pb-4">
        Wallet Info
      </h2>

      {authenticated && user ? (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-2">
              Wallet Address
            </p>
            <p className="text-white text-sm font-mono truncate">
              {user.wallet?.address ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-2">
              Network
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-white text-sm font-mono">Arbitrum One</p>
            </div>
          </div>
          <div>
            <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-2">
              Connection Status
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-green-600 bg-green-600/10 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs uppercase tracking-[3px] font-mono">
                Connected
              </span>
            </div>
          </div>
          <div>
            <p className="text-[#444] text-xs font-mono uppercase tracking-[2px] mb-2">
              Wallet Type
            </p>
            <p className="text-white text-sm font-mono capitalize">
              {user.wallet?.walletClientType ?? "—"}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[#444] text-xs font-mono uppercase tracking-[3px]">
            No wallet connected
          </p>
        </div>
      )}
    </div>
  );
}
