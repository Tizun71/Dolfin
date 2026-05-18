"use client";
import { usePrivy } from "@privy-io/react-auth";

export default function Header() {
  const { login, logout, authenticated, user } = usePrivy();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-black border-b border-[#262626] flex items-center justify-between px-10 z-20 font-sans">
      <div className="flex items-center gap-4">
        <span className="text-white text-[15px] font-medium uppercase tracking-[4px]">
          Dolfin{" "}
        </span>
        <div className="flex items-center gap-2 ml-4">
          <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[#444] text-[12px] uppercase tracking-[2px]">
            System Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <button className="border border-white/20 px-5 py-2 text-xs text-white uppercase tracking-[2px] transition-all duration-300 hover:bg-white hover:text-black hover:border-white">
            Omnichain
          </button>
        </div>

        <div className="h-6 w-[1px] bg-[#262626]"></div>

        {authenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-[#888] text-xs uppercase tracking-[2px]">
              {user?.wallet?.address?.slice(0, 6)}...
              {user?.wallet?.address?.slice(-4)}
            </span>
            <button
              onClick={logout}
              className="border border-red-500/50 px-5 py-2 text-xs text-red-400 uppercase tracking-[2px] transition-all duration-300 hover:bg-red-500 hover:text-white"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="border border-white/20 px-5 py-2 text-xs text-white uppercase tracking-[2px] transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
