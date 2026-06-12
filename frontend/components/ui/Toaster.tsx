"use client";

import { Toaster as Sonner } from "sonner";

// App-wide toast host. Themed to match Dolfin: sharp dark surface, mono type, orange brand accent.
// Toasts appear top-center. Use via `import { toast } from "sonner"`.
export default function Toaster() {
  return (
    <Sonner
      position="top-center"
      theme="dark"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-[#0a0a0a] !border !border-[#262626] !rounded-none !text-white !font-mono !text-xs !tracking-[1px] !shadow-[0_12px_40px_rgba(0,0,0,0.9)]",
          title: "!text-white !uppercase !tracking-[2px] !text-xs",
          description: "!text-[#888] !tracking-[0.5px]",
          actionButton:
            "!bg-[#f97316] !text-black !rounded-none !uppercase !tracking-[2px]",
          cancelButton: "!bg-white/10 !text-white !rounded-none",
          closeButton:
            "!bg-[#141414] !border-[#262626] !text-[#888] hover:!text-white",
          success: "!text-green-400",
          error: "!text-red-400",
          warning: "!text-yellow-400",
          info: "!text-[#f97316]",
        },
      }}
    />
  );
}
