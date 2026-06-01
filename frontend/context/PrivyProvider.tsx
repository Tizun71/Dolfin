"use client";
import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    console.error(
      "Thiếu cấu hình NEXT_PUBLIC_PRIVY_APP_ID trong file .env.local",
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId || ""}
      config={{
        loginMethods: ["email", "google", "twitter", "wallet"],

        appearance: {
          theme: "dark",
          accentColor: "#627EEA",

          walletList: ["metamask", "coinbase_wallet", "rainbow", "phantom"],
        },

        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
