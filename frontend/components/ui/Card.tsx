import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#141414] border border-[#262626] rounded-none p-6 ${className}`}
    >
      {children}
    </div>
  );
}
