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
    <div className="border border-[#1a1a1a] bg-[#050505] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#1a1a1a] pb-4">
        <h2 className="text-xs font-mono uppercase tracking-[3px] text-[#444]">
          Preferences
        </h2>
        <button
          onClick={handleSave}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-[2px] transition-all duration-300 border ${
            saved
              ? "border-green-600 text-green-400 bg-green-600/10"
              : "border-[#333] text-[#666] hover:border-white hover:text-white"
          }`}
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {/* Toggle Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between border border-[#111] p-4"
          >
            <div>
              <p className="text-white text-sm font-light tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-[#444] text-xs font-mono">{item.desc}</p>
            </div>

            {/* Toggle */}
            <button
              onClick={() => handleToggle(item.key)}
              className={`relative w-10 h-5 transition-all duration-300 border ${
                prefs[item.key]
                  ? "border-white bg-white/10"
                  : "border-[#333] bg-transparent"
              }`}
            >
              <span
                className={`absolute top-0.5 w-3.5 h-3.5 transition-all duration-300 ${
                  prefs[item.key] ? "left-5 bg-white" : "left-0.5 bg-[#444]"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
