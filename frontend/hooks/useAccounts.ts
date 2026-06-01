"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { type Address } from "viem";
import { buildWalletClient, errMsg, getActiveWallet } from "@/lib/dolfin-wallet";
import { provisionAccount } from "@/lib/dolfin-actions";
import { addAccount, listAccounts, nextSalt, type StoredAccount } from "@/lib/account-store";
import { toast } from "sonner";

// Owner's smart accounts (multi-account via salt). Lists registry + provisions new accounts.
export function useAccounts() {
  const { wallets } = useWallets();
  const [owner, setOwner] = useState<Address | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback((ownerAddr: Address) => {
    setAccounts(listAccounts(ownerAddr));
  }, []);

  useEffect(() => {
    const wallet = getActiveWallet(wallets);
    if (!wallet) return;
    const ownerAddr = wallet.address as Address;
    let cancelled = false;
    Promise.resolve(listAccounts(ownerAddr)).then((a) => {
      if (cancelled) return;
      setOwner(ownerAddr);
      setAccounts(a);
    });
    return () => {
      cancelled = true;
    };
  }, [wallets]);

  const createAccount = async () => {
    setLoading(true);
    try {
      const wallet = getActiveWallet(wallets);
      if (!wallet) throw new Error("Please connect an external wallet first.");
      const { walletClient, owner: ownerAddr } = await buildWalletClient(wallet);
      const salt = nextSalt(ownerAddr);
      const address = await provisionAccount(walletClient, ownerAddr, salt);
      addAccount(ownerAddr, salt, address);
      reload(ownerAddr);
      return address;
    } catch (e: unknown) {
      console.error("[DOLFIN] create account failed:", e);
      toast.error(errMsg(e, "Failed to create account."));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { owner, accounts, loading, createAccount };
}
