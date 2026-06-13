import type { Metadata } from "next";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy - Dolfin",
  description: "How Dolfin handles data when you use the AI DeFi portfolio agent.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: [
      "Dolfin is a non-custodial application. We never take possession of your funds or private keys. Trading happens through a scoped session key on your own ERC-4337 smart account, which you can revoke at any time.",
      "We collect the minimum needed to run the service: your connected wallet address, the on-chain policy you configure, and technical logs such as IP address, browser type, and timestamps for security and debugging.",
    ],
  },
  {
    heading: "On-chain data",
    body: [
      "Transactions, balances, and policy settings live on the Arbitrum network. This data is public by design and not controlled by Dolfin. Anyone can read it through a block explorer.",
    ],
  },
  {
    heading: "How we use data",
    body: [
      "We use collected data to operate the agent, enforce your risk limits, surface portfolio analytics, and protect against abuse. We do not sell personal data.",
      "Authentication is handled by Privy. Their handling of login credentials is governed by Privy's own privacy policy.",
    ],
  },
  {
    heading: "Third parties",
    body: [
      "We rely on infrastructure providers including RPC node operators, Privy for auth, and analytics tooling. These providers process limited technical data on our behalf under their own terms.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can disconnect your wallet, revoke the agent's session key, or trigger the guardian kill-switch at any time. Disconnecting stops further data collection tied to your session.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about this policy can be sent to contact@dolfin.io.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="June 12, 2026"
      intro="This policy explains what data Dolfin collects, why, and the control you keep over it. Dolfin is non-custodial: you hold your keys and capital at all times."
      sections={SECTIONS}
    />
  );
}
