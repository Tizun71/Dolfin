import { useState } from "react";

export function useAssetSetup(assetKey: string) {
  const [isRunning, setIsRunning] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`setupDone_${assetKey}`) === "true";
  });

  const [showSetup, setShowSetup] = useState(false);

  const onComplete = () => {
    localStorage.setItem(`setupDone_${assetKey}`, "true");
    setShowSetup(false);
    setIsRunning(true);
  };

  const onClose = () => {
    setShowSetup(false);
  };

  const onReset = () => {
    localStorage.removeItem(`setupDone_${assetKey}`);
    setIsRunning(false);
  };

  return { isRunning, showSetup, setShowSetup, onComplete, onClose, onReset };
}
