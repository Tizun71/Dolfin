"use client";

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
}

interface FloatingOrbsBackgroundProps {
  children: React.ReactNode;
  orbCount?: number;
  colors?: string[];
}

export function FloatingOrbsBackground({
  children,
  orbCount = 4,
  colors = [
    "rgba(250, 204, 21, 0.08)",
    "rgba(251, 191, 36, 0.08)",
  ],
}: FloatingOrbsBackgroundProps) {
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

    const orbs: Orb[] = [];
    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 120 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[i % colors.length],
      });
    }

    const draw = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= interval) {
        lastTime = currentTime - (deltaTime % interval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        orbs.forEach((orb) => {
          orb.x += orb.vx;
          orb.y += orb.vy;

          if (orb.x < -orb.radius || orb.x > canvas.width + orb.radius) {
            orb.vx *= -1;
          }
          if (orb.y < -orb.radius || orb.y > canvas.height + orb.radius) {
            orb.vy *= -1;
          }

          const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
          gradient.addColorStop(0, orb.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [orbCount, colors]);

  return (
    <div className="relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ willChange: 'transform', filter: 'blur(40px)' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
