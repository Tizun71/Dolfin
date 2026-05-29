import { useState } from "react";
import { useWallets, useSign7702Authorization } from "@privy-io/react-auth";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  encodePacked,
  keccak256,
  getAddress,
} from "viem";
import { arbitrumSepolia } from "viem/chains";

type Step = "sign" | "approve" | "done";

const DOLFIN_CONFIG = {
  chainId: 421614,
  contractAddress:
    "0xa8e99c6e7c7a40e89bd20e8b68e1cacb87bb0743" as `0x${string}`,
  initializeData: "0x8129ec8b" as `0x${string}`,
} as const;

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

const normalizeAuthorization = (auth: any, userAddress: string) => {
  return {
    address: userAddress as `0x${string}`,
    contractAddress: (auth.contractAddress ?? auth.address) as `0x${string}`,
    chainId: Number(auth.chainId),
    nonce: Number(auth.nonce),
    r: auth.r as `0x${string}`,
    s: auth.s as `0x${string}`,
    yParity: (auth.yParity !== undefined
      ? Number(auth.yParity) === 0
        ? 0
        : 1
      : Number(auth.v) === 27 || Number(auth.v) === 0
        ? 0
        : 1) as 0 | 1,
  };
};

export function useDolfinAccount(onComplete: () => void) {
  const { wallets } = useWallets();
  const { signAuthorization } = useSign7702Authorization();

  const [currentStep, setCurrentStep] = useState<Step>("sign");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAuthorization, setSavedAuthorization] = useState<any>(null);

  const getActiveWallet = () => {
    if (!wallets.length) return null;
    return (
      wallets.find((w) => w.walletClientType !== "privy") ??
      wallets.find((w) => w.walletClientType === "privy") ??
      wallets[0]
    );
  };

  const ensureCorrectNetwork = async (wallet: any): Promise<boolean> => {
    if (wallet.chainId === `eip155:${DOLFIN_CONFIG.chainId}`) return true;
    try {
      await wallet.switchChain(DOLFIN_CONFIG.chainId);
      return true;
    } catch {
      setError("Please switch your wallet network to Arbitrum Sepolia.");
      return false;
    }
  };

  const handleSign = async () => {
    setLoading(true);
    setError("");

    try {
      const wallet = getActiveWallet();
      if (!wallet) {
        setError("Please connect your wallet or log in first.");
        return;
      }

      const isNetworkValid = await ensureCorrectNetwork(wallet);
      if (!isNetworkValid) return;

      let authorization;

      if (wallet.walletClientType === "privy") {
        authorization = await signAuthorization(
          {
            contractAddress: DOLFIN_CONFIG.contractAddress,
            chainId: DOLFIN_CONFIG.chainId,
          },
          { address: wallet.address },
        );
      } else {
        const provider = await wallet.getEthereumProvider();
        const currentNonce = await publicClient.getTransactionCount({
          address: wallet.address as `0x${string}`,
        });

        const walletClient = createWalletClient({
          account: wallet.address as `0x${string}`,
          chain: arbitrumSepolia,
          transport: custom(provider),
        });

        const encodedPayload = encodePacked(
          ["uint8", "uint256", "address", "uint256"],
          [
            5,
            BigInt(DOLFIN_CONFIG.chainId),
            getAddress(DOLFIN_CONFIG.contractAddress),
            BigInt(currentNonce),
          ],
        );
        const authHash = keccak256(encodedPayload);

        const signature = await walletClient.signMessage({
          account: wallet.address as `0x${string}`,
          message: { raw: authHash },
        });

        authorization = {
          contractAddress: DOLFIN_CONFIG.contractAddress,
          chainId: DOLFIN_CONFIG.chainId,
          nonce: currentNonce,
          r: `0x${signature.slice(2, 66)}` as `0x${string}`,
          s: `0x${signature.slice(66, 130)}` as `0x${string}`,
          yParity: parseInt(signature.slice(130, 132), 16) === 27 ? 0 : 1,
        };
      }

      const normalized = normalizeAuthorization(authorization, wallet.address);
      setSavedAuthorization(normalized);
      setCurrentStep("approve");
    } catch (e: any) {
      console.error("[DOLFIN] Signing step failed:", e);
      setError(e?.message || "Authorization signature failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError("");

    try {
      const wallet = getActiveWallet();
      if (!wallet || !savedAuthorization) {
        setError("Valid authorization signature not found.");
        return;
      }

      const address = wallet.address as `0x${string}`;

      const [nonce, fees] = await Promise.all([
        publicClient.getTransactionCount({ address }),
        publicClient.estimateFeesPerGas(),
      ]);

      const gasEstimate = await publicClient.estimateGas({
        account: address,
        to: address,
        data: DOLFIN_CONFIG.initializeData,
        authorizationList: [savedAuthorization],
      });

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: address,
        chain: arbitrumSepolia,
        transport: custom(provider),
      });

      const txHash = await walletClient.sendTransaction({
        account: address,
        to: address,
        data: DOLFIN_CONFIG.initializeData,
        nonce,
        gas: (gasEstimate * BigInt(120)) / BigInt(100),
        maxFeePerGas: fees.maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        experimental_authorizationList: [savedAuthorization],
      } as any);

      console.log("[DOLFIN] ✅ Execution success. Tx Hash:", txHash);

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setCurrentStep("done");
      setTimeout(onComplete, 1000);
    } catch (e: any) {
      console.error("[DOLFIN] Execution step failed:", e);
      setError(
        e?.message || "Failed to send account initialization transaction.",
      );
    } finally {
      setLoading(false);
    }
  };

  return { currentStep, loading, error, handleSign, handleApprove };
}
