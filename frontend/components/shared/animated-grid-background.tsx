"use client";

import { useEffect, useRef } from "react";

interface AnimatedGridBackgroundProps {
  children: React.ReactNode;
  gridColor?: string;
  glowColor?: string;
}

export function AnimatedGridBackground({
  children,
  gridColor = "rgba(250, 204, 21, 0.06)",
  glowColor = "rgba(250, 204, 21, 0.15)",
}: AnimatedGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const gridSize = 50;
    let offset = 0;

    const draw = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= interval) {
        lastTime = currentTime - (deltaTime % interval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;

        for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
          const animatedX = x + (offset % gridSize);
          ctx.beginPath();
          ctx.moveTo(animatedX, 0);
          ctx.lineTo(animatedX, canvas.height);
          ctx.stroke();
        }

        for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
          const animatedY = y + (offset % gridSize);
          ctx.beginPath();
          ctx.moveTo(0, animatedY);
          ctx.lineTo(canvas.width, animatedY);
          ctx.stroke();
        }

        offset += 0.3;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridColor, glowColor]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        style={{ willChange: 'transform' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
