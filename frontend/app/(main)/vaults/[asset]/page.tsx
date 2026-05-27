import ETHDetail from "@/components/views/vaults/assets/eth/ETHDetail";
import WeETHDetail from "@/components/views/vaults/assets/weeth/WeETHDetail";
import SGHODetail from "@/components/views/vaults/assets/sgho/SGHODetail";
import WBTCDetail from "@/components/views/vaults/assets/wbtc/WBTCDetail";
import USDCDetail from "@/components/views/vaults/assets/usdc/USDCDetail";
import USDTDetail from "@/components/views/vaults/assets/usdt/USDTDetail";
import WstETHDetail from "@/components/views/vaults/assets/wsteth/WstETHDetail";
import { use } from "react";

export default function AssetPage({
  params,
}: {
  params: Promise<{ asset: string }>;
}) {
  const { asset } = use(params);
  switch (asset) {
    case "eth":
      return <ETHDetail />;
    case "sgho":
      return <SGHODetail />;
    case " weeth":
      return <WeETHDetail />;
    case "wbtc":
      return <WBTCDetail />;
    case "usdc":
      return <USDCDetail />;
    case "usdt":
      return <USDTDetail />;
    case "wsteth":
      return <WstETHDetail />;
    default:
      return null;
  }
}
