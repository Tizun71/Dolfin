"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { formatUnits, parseUnits, type Address } from "viem";
import { TRANSFER_TOKENS, type TransferToken } from "@/constants/dolfin";
import { buildWalletClient, errMsg, getActiveWallet } from "@/lib/dolfin-wallet";
import { balanceOf, deposit, withdraw } from "@/lib/dolfin-actions";
import { toast } from "sonner";

export type TransferMode = "deposit" | "withdraw";

// Deposit/withdraw between owner EOA and the smart account for one selected token.
export function useAccountTransfer(
  owner: Address | null,
  account: Address | null,
  mode: TransferMode,
  onDone: () => void,
) {
  const { wallets } = useWallets();
  const [token, setToken] = useState<TransferToken>(TRANSFER_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [ownerBal, setOwnerBal] = useState<bigint | null>(null);
  const [acctBal, setAcctBal] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);

  // Source balance = where funds come FROM (owner for deposit, account for withdraw).
  const sourceBal = mode === "deposit" ? ownerBal : acctBal;

  useEffect(() => {
    if (!owner || !account) return;
    let cancelled = false;
    Promise.all([balanceOf(token, owner), balanceOf(token, account)])
      .then(([o, a]) => {
        if (cancelled) return;
        setOwnerBal(o);
        setAcctBal(a);
      })
      .catch((e) => !cancelled && toast.error(errMsg(e, "Failed to read balances.")));
    return () => {
      cancelled = true;
    };
  }, [owner, account, token, mode]);

  const setMax = () => {
    if (sourceBal != null) setAmount(formatUnits(sourceBal, token.decimals));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const wallet = getActiveWallet(wallets);
      if (!wallet) throw new Error("Please connect an external wallet first.");
      if (!account) throw new Error("Account not ready.");
      let value: bigint;
      try {
        value = parseUnits(amount || "0", token.decimals);
      } catch {
        throw new Error("Invalid amount.");
      }
      if (value <= BigInt(0)) throw new Error("Amount must be greater than 0.");
      if (sourceBal != null && value > sourceBal) throw new Error("Amount exceeds available balance.");

      const { walletClient, owner: o } = await buildWalletClient(wallet);
      if (mode === "deposit") await deposit(walletClient, o, account, token, value);
      else await withdraw(walletClient, o, account, token, value);

      toast.success(`${mode === "deposit" ? "Deposited" : "Withdrew"} ${amount} ${token.symbol}.`);
      setAmount("");
      // refresh balances
      const [no, na] = await Promise.all([balanceOf(token, o), balanceOf(token, account)]);
      setOwnerBal(no);
      setAcctBal(na);
      onDone();
    } catch (e: unknown) {
      console.error(`[DOLFIN] ${mode} failed:`, e);
      toast.error(errMsg(e, `${mode} failed.`));
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    setToken,
    amount,
    setAmount,
    setMax,
    ownerBal,
    acctBal,
    sourceBal,
    loading,
    submit,
  };
}
