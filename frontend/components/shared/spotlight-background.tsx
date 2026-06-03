"use client";

import { useState, useRef, ReactNode } from "react";

interface SpotlightBackgroundProps {
  children: ReactNode;
  gradientRadius?: number;
  gradientColor?: string;
}

export function useSpotlightBackground(
  gradientRadius: number = 600,
  gradientColor: string = "rgba(250, 204, 21, 0.08)"
) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const spotlightStyle = {
    background: `radial-gradient(${gradientRadius}px at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}, transparent 80%)`,
  };

  return { containerRef, handleMouseMove, spotlightStyle };
}

export function SpotlightBackground({
  children,
  gradientRadius = 600,
  gradientColor = "rgba(250, 204, 21, 0.08)",
}: SpotlightBackgroundProps) {
  const { containerRef, handleMouseMove, spotlightStyle } = useSpotlightBackground(
    gradientRadius,
    gradientColor
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={spotlightStyle}
      />
      {/* Children */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
