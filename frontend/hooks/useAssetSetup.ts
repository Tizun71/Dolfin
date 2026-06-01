import { useState } from "react";

export interface AssetSetupData {
  asset: string;
  name: string;
  apy: number;
  totalSupplied: string;
  utilizationRate: string;
  status: "running";
  lastAction: string;
  startedAt: number;
}

export function useAssetSetup(
  assetKey: string,
  data: Omit<AssetSetupData, "asset" | "status" | "startedAt">,
) {
  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("dolfin_running_strategies");
    if (!stored) return false;
    const strategies: AssetSetupData[] = JSON.parse(stored);
    return strategies.some((s) => s.asset === assetKey.toLowerCase());
  });

  const [showSetup, setShowSetup] = useState(false);

  const onComplete = () => {
    const stored = localStorage.getItem("dolfin_running_strategies");
    const strategies: AssetSetupData[] = stored ? JSON.parse(stored) : [];

    const newStrategy: AssetSetupData = {
      asset: assetKey.toLowerCase(),
      name: data.name,
      apy: data.apy,
      totalSupplied: data.totalSupplied,
      utilizationRate: data.utilizationRate,
      status: "running",
      lastAction: data.lastAction,
      startedAt: Date.now(),
    };

    const exists = strategies.findIndex(
      (s) => s.asset === assetKey.toLowerCase(),
    );
    if (exists >= 0) {
      strategies[exists] = newStrategy;
    } else {
      strategies.push(newStrategy);
    }

    localStorage.setItem(
      "dolfin_running_strategies",
      JSON.stringify(strategies),
    );
    setShowSetup(false);
    setIsRunning(true);
  };

  const onClose = () => {
    setShowSetup(false);
  };

  const onReset = () => {
    localStorage.removeItem("dolfin_running_strategies");
    setIsRunning(false);
  };

  return { isRunning, showSetup, setShowSetup, onComplete, onClose, onReset };
}
