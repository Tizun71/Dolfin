import { useState, useEffect } from "react";
import { AssetSetupData } from "./useAssetSetup";

export function useRunningStrategies() {
  const [strategies, setStrategies] = useState<AssetSetupData[]>([]);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem("dolfin_running_strategies");
      if (!stored) {
        setStrategies([]);
        return;
      }
      setStrategies(JSON.parse(stored));
    };

    load();

    window.addEventListener("storage", load);
    const interval = setInterval(load, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", load);
    };
  }, []);

  return { strategies };
}
