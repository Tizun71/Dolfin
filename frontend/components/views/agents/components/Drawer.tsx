"use client";

import { type ReactNode } from "react";

// Right-side slide-in drawer. Stays mounted for the slide transition.
export default function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#050505] border-l border-[#222] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#222]">
          <h2 className="text-sm font-normal uppercase tracking-[3px] text-[#cccccc]">{title}</h2>
          <button onClick={onClose} className="text-[#444] hover:text-white text-sm font-mono transition">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-auto px-8 py-8">{children}</div>
      </div>
    </div>
  );
}
