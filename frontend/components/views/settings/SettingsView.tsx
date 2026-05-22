"use client";

import WalletSection from "@/components/views/settings/components/WalletSection";
import AIConfigSection from "@/components/views/settings/components/AIConfigSection";
import PreferencesSection from "@/components/views/settings/components/PreferencesSection";

export default function SettingsView() {
  return (
    <div className="text-white font-sans">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-normal uppercase tracking-[4px] text-white mb-2">
          Settings
        </h1>
        <p className="text-[#444] text-xs font-mono uppercase tracking-[2px]">
          Manage your wallet, AI configuration and preferences
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        <WalletSection />
        <AIConfigSection />
        <PreferencesSection />
      </div>
    </div>
  );
}
