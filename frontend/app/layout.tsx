import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import PrivyProviderWrapper from "@/context/PrivyProvider";
import Toaster from "@/components/ui/Toaster";

const sans = IBM_Plex_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dolfin - AI DeFi Assistant",
  description: "AI-powered chatbot for DeFi decision making",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black">
        <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
