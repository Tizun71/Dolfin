import type { Metadata } from "next";
import LegalDocument, { type LegalSection } from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service - Dolfin",
  description: "The terms that govern your use of the Dolfin AI DeFi portfolio agent.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Acceptance",
    body: [
      "By connecting a wallet and using Dolfin, you agree to these terms. If you do not agree, do not use the service.",
    ],
  },
  {
    heading: "What Dolfin is",
    body: [
      "Dolfin is a non-custodial AI agent that plans and executes DeFi strategies inside the on-chain policy you set. It operates through a scoped session key on your ERC-4337 smart account. You retain custody of your funds and can revoke access at any time.",
    ],
  },
  {
    heading: "No financial advice",
    body: [
      "Dolfin is software, not a broker, advisor, or fiduciary. Nothing in the app is investment, tax, or legal advice. You are solely responsible for the policies you configure and the trades they authorize.",
    ],
  },
  {
    heading: "Risk",
    body: [
      "DeFi carries real risk. Smart contracts can have bugs, markets move fast, and on-chain actions are irreversible. You can lose funds. Risk scoring and policy limits reduce but do not eliminate this risk.",
      "Dolfin depends on third-party protocols such as Aave on Arbitrum. We do not control those protocols and are not liable for their behavior, downtime, or exploits.",
    ],
  },
  {
    heading: "Your responsibilities",
    body: [
      "Keep your wallet and login secure. Review your policy limits before funding the agent. Use the guardian kill-switch if something looks wrong.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "Dolfin is provided as-is, without warranties of any kind. To the maximum extent permitted by law, the Dolfin team is not liable for losses arising from use of the service, including lost funds, missed opportunities, or protocol failures.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "We may update these terms as the product evolves. Continued use after an update means you accept the revised terms.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Reach us at contact@dolfin.io with any questions about these terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated="June 12, 2026"
      intro="These terms govern your use of Dolfin. Read them before connecting a wallet. In short: Dolfin is non-custodial software, DeFi is risky, and you stay in control of your capital."
      sections={SECTIONS}
    />
  );
}
