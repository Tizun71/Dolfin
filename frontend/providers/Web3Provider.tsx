"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PropsWithChildren } from "react";

export default function Web3Provider({ children }: PropsWithChildren) {
  return <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}>{children}</PrivyProvider>;
}
