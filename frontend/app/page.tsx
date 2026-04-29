"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnection } from "wagmi";

export default function Home() {
  const { isConnected } = useConnection();

  return (
    <div>
      <ConnectButton />
      {isConnected && <p className="text-2xl text-green-500">You are connected!</p>}
    </div>
  );
}
