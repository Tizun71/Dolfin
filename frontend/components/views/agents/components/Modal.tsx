"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Centered modal overlay, portaled to <body> so a transformed ancestor (card-3d) can't trap the
// fixed positioning. Scrolls when content is tall.
export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto p-4 md:p-8">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-5xl my-6 bg-[#050505] border border-[#222] p-8 shadow-2xl">
        {children}
      </div>
    </div>,
    document.body,
  );
}
