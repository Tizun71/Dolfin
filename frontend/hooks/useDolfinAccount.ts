import { useState } from "react";
import { useWallets, useSign7702Authorization } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";

type Step = "sign" | "approve" | "done";

const DOLFIN_CONFIG = {
  chainId: 421614, // Arbitrum Sepolia
  contractAddress:
    "0xA8E99C6E7c7a40e89Bd20e8b68e1Cacb87BB0743" as `0x${string}`,
  initializeData: "0x8129ec8b" as `0x${string}`, // Selector hàm initialize()
};

export function useDolfinAccount(onComplete: () => void) {
  const { wallets } = useWallets();
  const { signAuthorization } = useSign7702Authorization();

  const [currentStep, setCurrentStep] = useState<Step>("sign");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedAuthorization, setSavedAuthorization] = useState<any>(null);

  const getActiveWallet = () => {
    if (wallets.length === 0) return null;
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    const externalWallet = wallets.find((w) => w.walletClientType !== "privy");

    return embeddedWallet || externalWallet || wallets[0];
  };

  const ensureCorrectNetwork = async (wallet: any): Promise<boolean> => {
    if (wallet.chainId === `eip155:${DOLFIN_CONFIG.chainId}`) return true;
    try {
      await wallet.switchChain(DOLFIN_CONFIG.chainId);
      return true;
    } catch (error) {
      setError("Vui lòng chuyển ví sang mạng Arbitrum Sepolia.");
      return false;
    }
  };

  const handleSign = async () => {
    setLoading(true);
    setError("");
    try {
      const wallet = getActiveWallet();
      if (!wallet) return setError("Vui lòng kết nối ví hoặc đăng nhập trước.");

      const isNetworkValid = await ensureCorrectNetwork(wallet);
      if (!isNetworkValid) return;

      if (wallet.walletClientType === "privy") {
        console.log(
          "Đang gọi Privy SDK thực hiện ký thực tế cho Ví Nhúng Gmail...",
        );
        const authorization = await signAuthorization(
          {
            contractAddress: DOLFIN_CONFIG.contractAddress,
            chainId: DOLFIN_CONFIG.chainId,
          },
          { address: wallet.address },
        );

        setSavedAuthorization(authorization);
        setCurrentStep("approve");
        return;
      }

      console.log(
        `Đang yêu cầu ví ngoài (${wallet.walletClientType}) gọi RPC ký EIP-7702...`,
      );
      const provider = await wallet.getEthereumProvider();

      const authorization = await provider.request({
        method: "wallet_signAuthorization",
        params: [
          {
            contractAddress: DOLFIN_CONFIG.contractAddress,
            chainId: DOLFIN_CONFIG.chainId,
          },
        ],
      });

      console.log("Ví ngoài đã xử lý ký thành công:", authorization);
      setSavedAuthorization(authorization);
      setCurrentStep("approve");
    } catch (e: any) {
      console.error("Chi tiết lỗi bước ký:", e);

      const activeWallet = getActiveWallet();
      if (e?.message?.includes("does not exist") || e?.code === -32601) {
        setError(
          `Ví ${activeWallet?.walletClientType || "ngoài"} của bạn hiện tại chưa cập nhật phiên bản hỗ trợ chuẩn ký EIP-7702.`,
        );
      } else {
        setError(e?.message || "Quá trình ký ủy quyền thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError("");
    try {
      const wallet = getActiveWallet();
      if (!wallet || !savedAuthorization)
        return setError("Không tìm thấy thông tin chữ ký hợp lệ.");

      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: arbitrumSepolia,
        transport: custom(provider),
      });

      console.log("Đang gửi Transaction thực tế lên mạng chuỗi...");
      const txHash = await walletClient.sendTransaction({
        account: wallet.address as `0x${string}`,
        to: wallet.address as `0x${string}`,
        data: DOLFIN_CONFIG.initializeData,
        authorizationList: Array.isArray(savedAuthorization)
          ? savedAuthorization
          : [savedAuthorization],
      });

      console.log("Kích hoạt on-chain thành công! Tx Hash:", txHash);
      setCurrentStep("done");
      setTimeout(() => onComplete(), 1000);
    } catch (e: any) {
      console.error("Chi tiết lỗi bước gửi Tx:", e);
      setError(e?.message || "Gửi transaction kích hoạt thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    loading,
    error,
    handleSign,
    handleApprove,
  };
}
