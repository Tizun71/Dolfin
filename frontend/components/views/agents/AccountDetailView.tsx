"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { getActiveWallet } from "@/lib/dolfin-wallet";
import { getAccount, type StoredAccount } from "@/lib/account-store";
import { type TransferMode } from "@/hooks/useAccountTransfer";
import AccountStatusCard from "./components/AccountStatusCard";
import SessionPanel from "./components/SessionPanel";
import AgentActivityPanel from "./components/AgentActivityPanel";
import CreateSessionForm from "./components/CreateSessionForm";
import TransferDrawer from "./components/TransferDrawer";
import Modal from "./components/Modal";

export default function AccountDetailView({ address }: { address: Address }) {
  const { wallets } = useWallets();
  const [owner, setOwner] = useState<Address | null>(null);
  const [acct, setAcct] = useState<StoredAccount | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [drawer, setDrawer] = useState<TransferMode | null>(null);

  useEffect(() => {
    const wallet = getActiveWallet(wallets);
    if (!wallet) return;
    const ownerAddr = wallet.address as Address;
    let cancelled = false;
    Promise.resolve(getAccount(ownerAddr, address)).then((a) => {
      if (cancelled) return;
      setOwner(ownerAddr);
      setAcct(a);
    });
    return () => {
      cancelled = true;
    };
  }, [wallets, address]);

  const reload = () => owner && setAcct(getAccount(owner, address));
  const sessions = acct?.sessions ?? [];

  return (
    <div className="text-white font-sans">
      <div className="flex items-end justify-between mb-12">
        <div>
          <Link href="/agents" className="text-[#666] hover:text-white text-xs font-mono uppercase tracking-[2px] transition">
            ← Accounts
          </Link>
          <h1 className="text-3xl font-normal uppercase tracking-[4px] text-white mt-4">
            {acct ? `Account #${acct.salt + 1}` : "Account"}
          </h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-brand px-6 py-3 text-xs uppercase tracking-[3px] font-mono"
        >
          + New Agent
        </button>
      </div>

      <div className="space-y-8">
        <AccountStatusCard
          owner={owner ?? undefined}
          account={address}
          exists
          onDeposit={() => setDrawer("deposit")}
          onWithdraw={() => setDrawer("withdraw")}
        />

        {/* Sessions / agents */}
        <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444] border-b border-[#1a1a1a] pb-4">
          Agents ({sessions.length})
        </h2>
        {sessions.length ? (
          <>
            {sessions.map((s, i) => (
              <SessionPanel
                key={s.key}
                index={i}
                owner={owner}
                account={address}
                sessionKey={s.key}
                settings={s.settings}
                onSessionKeyChange={reload}
              />
            ))}
            {/* What the backend AI agent is actually doing for this account. */}
            <AgentActivityPanel owner={owner} account={address} />
          </>
        ) : (
          <div className="card-3d p-12 text-center">
            <p className="text-[#444] text-xs font-mono uppercase tracking-[3px]">No agents yet</p>
            <p className="text-[#333] text-sm font-mono mt-3">Create an agent to delegate scoped trading</p>
          </div>
        )}
      </div>

      <TransferDrawer
        open={drawer !== null}
        mode={drawer ?? "deposit"}
        owner={owner}
        account={address}
        onClose={() => setDrawer(null)}
        onDone={reload}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <CreateSessionForm
          account={address}
          onCancel={() => setShowCreate(false)}
          onDone={() => {
            reload();
            setShowCreate(false);
          }}
        />
      </Modal>
    </div>
  );
}
