"use client";

interface SectionDividerProps {
  variant?: "default" | "gradient" | "dots";
}

export default function SectionDivider({
  variant = "default",
}: SectionDividerProps) {
  if (variant === "gradient") {
    return (
      <div className="w-full py-12">
        <div className="max-w-4xl mx-auto h-px bg-linear-to-r from-transparent via-yellow-500/30 to-transparent" />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="w-full py-12 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/80" />
        <div className="w-20 h-px bg-yellow-500/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/80" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40" />
      </div>
    );
  }

  return (
    <div className="w-full py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-yellow-500/20" />
      </div>
    </div>
  );
}
