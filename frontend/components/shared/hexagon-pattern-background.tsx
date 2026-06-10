"use client";

interface HexagonPatternBackgroundProps {
  children: React.ReactNode;
  color?: string;
  opacity?: number;
}

export function HexagonPatternBackground({
  children,
  color = "#fbbf24",
  opacity = 0.05,
}: HexagonPatternBackgroundProps) {
  return (
    <div className="relative">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hexagons"
            width="50"
            height="43.4"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(2) rotate(0)"
          >
            <path
              d="M24.3 0L49.6 14.3v28.4L24.3 57 0 42.7V14.3z"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
              opacity={opacity}
            />
          </pattern>
          
          <radialGradient id="hex-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={opacity * 2} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#hexagons)" />
        <rect width="100%" height="100%" fill="url(#hex-gradient)" />
      </svg>
      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
