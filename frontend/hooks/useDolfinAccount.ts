import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { hashAuthorization } from "viem/experimental";
import { CHAIN_ID } from "@/constants/dolfin";
import { publicClient, getActiveWallet, ensureNetwork, errMsg } from "@/lib/dolfin-wallet";

type Step = "sign" | "approve" | "done";

const DOLFIN_CONFIG = {
  chainId: CHAIN_ID,
  contractAddress:
    "0xa8e99c6e7c7a40e89bd20e8b68e1cacb87bb0743" as `0x${string}`,
} as const;

export function useDolfinAccount(onComplete: () => void) {
  const { wallets } = useWallets();

  const [currentStep, setCurrentStep] = useState<Step>("sign");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAuthorization, setSavedAuthorization] = useState<any>(null);

  const handleSign = async () => {
    setLoading(true);
    setError("");

    try {
      const wallet = getActiveWallet(wallets);
      if (!wallet) {
        setError("Please connect an external wallet first.");
        return;
      }

      await ensureNetwork(wallet);

      const address = wallet.address as `0x${string}`;
      const provider = await wallet.getEthereumProvider();

      const nonce = await publicClient.getTransactionCount({ address });

      const authHash = hashAuthorization({
        contractAddress: DOLFIN_CONFIG.contractAddress,
        chainId: DOLFIN_CONFIG.chainId,
        nonce,
      });

      const walletClient = createWalletClient({
        account: address,
        chain: arbitrumSepolia,
        transport: custom(provider),
      });

      const signature = await walletClient.signMessage({
        account: address,
        message: { raw: authHash },
      });

      const r = signature.slice(0, 66) as `0x${string}`;
      const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
      const v = parseInt(signature.slice(130, 132), 16);
      const yParity = (v === 27 || v === 0 ? 0 : 1) as 0 | 1;

      const authorization = {
        contractAddress: DOLFIN_CONFIG.contractAddress,
        chainId: DOLFIN_CONFIG.chainId,
        nonce,
        r,
        s,
        yParity,
      };

      setSavedAuthorization(authorization);
      setCurrentStep("approve");
    } catch (e: any) {
      console.error("[DOLFIN] Signing step failed:", e);
      setError(errMsg(e, "Authorization signature failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError("");

    try {
      const wallet = getActiveWallet(wallets);
      if (!wallet || !savedAuthorization) {
        setError("Valid authorization signature not found.");
        return;
      }

      // Send the authorization to the backend; the agent wallet relays the transaction
      const response = await fetch("/api/dolfin/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: wallet.address,
          authorization: savedAuthorization,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Relay request failed.");
      }

      const { txHash } = await response.json();
      console.log("[DOLFIN] ✅ Relayed tx hash:", txHash);

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setCurrentStep("done");
      setTimeout(onComplete, 1000);
    } catch (e: any) {
      console.error("[DOLFIN] Approve step failed:", e);
      setError(errMsg(e, "Failed to initialize account."));
    } finally {
      setLoading(false);
    }
  };

  return { currentStep, loading, error, handleSign, handleApprove };
}
