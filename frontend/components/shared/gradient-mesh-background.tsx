"use client";

interface GradientMeshBackgroundProps {
  children: React.ReactNode;
  variant?: "radial" | "conic" | "mesh";
}

export function GradientMeshBackground({
  children,
  variant = "mesh",
}: GradientMeshBackgroundProps) {
  const getBackgroundStyle = () => {
    switch (variant) {
      case "radial":
        return {
          background: `
            radial-gradient(circle at 20% 50%, rgba(250, 204, 21, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            #000000
          `,
        };
      case "conic":
        return {
          background: `
            conic-gradient(from 180deg at 50% 50%, 
              rgba(0, 0, 0, 1) 0deg,
              rgba(250, 204, 21, 0.1) 90deg,
              rgba(0, 0, 0, 1) 180deg,
              rgba(251, 191, 36, 0.08) 270deg,
              rgba(0, 0, 0, 1) 360deg
            )
          `,
        };
      case "mesh":
      default:
        return {
          background: `
            radial-gradient(at 0% 0%, rgba(250, 204, 21, 0.08) 0%, transparent 50%),
            radial-gradient(at 100% 0%, rgba(251, 191, 36, 0.06) 0%, transparent 50%),
            radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
            radial-gradient(at 0% 100%, rgba(250, 204, 21, 0.05) 0%, transparent 50%),
            radial-gradient(at 50% 50%, rgba(251, 191, 36, 0.04) 0%, transparent 50%),
            #000000
          `,
        };
    }
  };

  return (
    <div className="relative">
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={getBackgroundStyle()}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
