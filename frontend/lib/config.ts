import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Dolfin",
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
});
