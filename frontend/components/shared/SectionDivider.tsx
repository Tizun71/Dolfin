"use client";

interface SectionDividerProps {
  variant?: "default" | "gradient" | "dots";
}

export default function SectionDivider({
  variant = "default",
}: SectionDividerProps) {
  if (variant === "gradient") {
    return (
      <div className="w-full py-12 bg-gradient-to-b from-black via-black to-[#131313]">
        <div className="max-w-6xl mx-auto h-0.5 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent rounded-full" />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="w-full py-12 flex items-center justify-center gap-3 bg-black">
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-500/50 to-yellow-500/20 rounded-full" />
        <div className="w-2 h-2 rounded-full bg-yellow-500" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
      </div>
    );
  }

  return (
    <div className="w-full py-12 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent rounded-full" />
      </div>
    </div>
  );
}
