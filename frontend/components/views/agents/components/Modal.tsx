"use client";

import { type ReactNode } from "react";

// Centered modal overlay. Scrolls when content is tall.
export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto p-4 md:p-8">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-5xl my-6 bg-[#050505] border border-[#222] p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
