// frontend/hooks/useDolfinAccount.ts
import { useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";

type Step = "sign" | "approve" | "done";

const DOLFIN_CONFIG = {
  chainId: 421614, // Arbitrum Sepolia
  contractAddress:
    "0xA8E99C6E7c7a40e89Bd20e8b68e1Cacb87BB0743" as `0x${string}`,
};

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
      const wallet = wallets[0];
      if (!wallet) {
        setError("Vui lòng kết nối ví trước.");
        return;
      }

      if (wallet.chainId !== `eip155:${DOLFIN_CONFIG.chainId}`) {
        try {
          await wallet.switchChain(DOLFIN_CONFIG.chainId);
        } catch (switchError) {
          setError(
            "Vui lòng chuyển ví sang mạng Arbitrum Sepolia trước khi ký.",
          );
          setLoading(false);
          return;
        }
      }

      console.log("Khởi tạo provider từ ví để chuẩn bị ký...");
      const provider = await wallet.getEthereumProvider();

      console.log("Gửi yêu cầu ký EIP-7702 tới ví của bạn...");

      const authorization = await provider.request({
        method: "wallet_signAuthorization",
        params: [
          {
            contractAddress: DOLFIN_CONFIG.contractAddress,
            chainId: DOLFIN_CONFIG.chainId,
          },
        ],
      });

      console.log("Ký EIP-7702 thành công thực tế:", authorization);
      setSavedAuthorization(authorization);
      setCurrentStep("approve");
    } catch (e: any) {
      console.error("Chi tiết lỗi khi ký:", e);
      setError(e?.message || "Ký thất bại hoặc loại ví chưa hỗ trợ EIP-7702.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    setError("");
    try {
      const wallet = wallets[0];
      if (!wallet || !savedAuthorization) {
        setError("Không tìm thấy thông tin chữ ký hợp lệ.");
        return;
      }

      console.log("Khởi tạo Viem Client...");
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as `0x${string}`,
        chain: arbitrumSepolia,
        transport: custom(provider),
      });

      // Selector của hàm initialize()
      const initializeData = "0x8129ec8b";

      console.log("Gửi transaction nâng cấp ví...");
      const txHash = await walletClient.sendTransaction({
        account: wallet.address as `0x${string}`,
        to: wallet.address as `0x${string}`,
        data: initializeData,
        authorizationList: Array.isArray(savedAuthorization)
          ? savedAuthorization
          : [savedAuthorization],
      });

      console.log("Kích hoạt thành công! Tx Hash:", txHash);
      setCurrentStep("done");
      setTimeout(() => onComplete(), 1000);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Gửi transaction kích hoạt thất bại. Thử lại.");
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
