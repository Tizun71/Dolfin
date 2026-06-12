"use client";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import ChainSwitcher from "./ChainSwitcher";
import WalletMenu from "./WalletMenu";
import LogoDolfin from "@/components/shared/LogoDolfin";

export default function Header() {
  const { login, authenticated } = usePrivy();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black border-b border-[#262626] flex items-center justify-between px-10 z-20 font-sans">
      <Link href="/dashboard" className="group flex items-center gap-3">
        <LogoDolfin size={30} />
        <h2 className="text-brand-gradient text-xl font-normal uppercase tracking-[4px]">Dolfin</h2>
      </Link>

      <div className="flex items-center gap-6">
        <ChainSwitcher />

        <div className="h-6 w-px bg-[#262626]"></div>

        {authenticated ? (
          <WalletMenu />
        ) : (
          <button
            onClick={login}
            className="btn-brand px-6 py-2.5 text-xs uppercase tracking-[3px] font-mono"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
