"use client";

import { useState, useEffect } from "react";

interface Preferences {
  notifications: boolean;
  emailSummary: boolean;
  autoApprove: boolean;
}

const defaultPreferences: Preferences = {
  notifications: true,
  emailSummary: false,
  autoApprove: false,
};

export default function PreferencesSection() {
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dolfin_preferences");
    if (stored) setPrefs(JSON.parse(stored));
  }, []);

  const handleToggle = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem("dolfin_preferences", JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const items = [
    {
      key: "notifications" as keyof Preferences,
      label: "Push Notifications",
      desc: "Alert when strategy status changes",
    },
    {
      key: "emailSummary" as keyof Preferences,
      label: "Weekly Summary",
      desc: "Email digest of AI performance",
    },
    {
      key: "autoApprove" as keyof Preferences,
      label: "Auto Approve",
      desc: "Automatically approve rebalancing actions",
    },
  ];

  return (
    <div className="border border-[#222] bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#222] pb-4">
        <h2 className="text-sm font-mono uppercase tracking-[2px] text-[#999] font-semibold">
          Preferences
        </h2>
        <button
          onClick={handleSave}
          className={`px-5 py-2 text-sm font-mono uppercase tracking-[1.5px] font-medium transition-all duration-300 border ${
            saved
              ? "border-green-600 text-green-300 bg-green-600/15"
              : "border-[#444] text-[#aaa] hover:border-white hover:text-white"
          }`}
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {/* Toggle Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between border border-[#222] p-5 hover:border-[#333] transition-colors duration-200"
          >
            <div>
              <p className="text-[#f0f0f0] text-sm font-mono font-medium tracking-wide mb-1.5">
                {item.label}
              </p>
              <p className="text-[#666] text-xs font-mono font-medium">
                {item.desc}
              </p>
            </div>

            {/* Toggle */}
            <button
              onClick={() => handleToggle(item.key)}
              className={`relative w-11 h-6 transition-all duration-300 border ${
                prefs[item.key]
                  ? "border-white bg-white/10"
                  : "border-[#444] bg-transparent"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 transition-all duration-300 ${
                  prefs[item.key] ? "left-5.5 bg-white" : "left-0.5 bg-[#666]"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
