"use client";

import { useEffect, useRef } from "react";

interface AnimatedGridBackgroundProps {
  children: React.ReactNode;
  gridColor?: string;
  glowColor?: string;
}

export function AnimatedGridBackground({
  children,
  gridColor = "rgba(250, 204, 21, 0.1)",
  glowColor = "rgba(250, 204, 21, 0.3)",
}: AnimatedGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);

    const gridSize = 40;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
        const animatedX = x + (offset % gridSize);
        ctx.beginPath();
        ctx.moveTo(animatedX, 0);
        ctx.lineTo(animatedX, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
        const animatedY = y + (offset % gridSize);
        ctx.beginPath();
        ctx.moveTo(0, animatedY);
        ctx.lineTo(canvas.width, animatedY);
        ctx.stroke();
      }

      // Mouse glow effect
      const gradient = ctx.createRadialGradient(
        mouseX,
        mouseY,
        0,
        mouseX,
        mouseY,
        200
      );
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      offset += 0.5;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridColor, glowColor]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
