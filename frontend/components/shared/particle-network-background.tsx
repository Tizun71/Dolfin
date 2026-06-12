"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface ParticleNetworkBackgroundProps {
  children: React.ReactNode;
  particleCount?: number;
  particleColor?: string;
  lineColor?: string;
  maxDistance?: number;
}

export function ParticleNetworkBackground({
  children,
  particleCount = 30,
  particleColor = "rgba(250, 204, 21, 0.6)",
  lineColor = "rgba(250, 204, 21, 0.2)",
  maxDistance = 120,
}: ParticleNetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 30;
    const interval = 1000 / fps;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
    };

    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * displayWidth,
        y: Math.random() * displayHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1.5,
      });
    }

    const draw = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= interval) {
        lastTime = currentTime - (deltaTime % interval);

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0) particle.x = displayWidth;
          if (particle.x > displayWidth) particle.x = 0;
          if (particle.y < 0) particle.y = displayHeight;
          if (particle.y > displayHeight) particle.y = 0;
        });

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            const maxDistSq = maxDistance * maxDistance;

            if (distSq < maxDistSq) {
              const opacity = (1 - distSq / maxDistSq) * 0.3;
              ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${opacity})`);
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = particleColor;
        particles.forEach((particle) => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
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
  }, [particleCount, particleColor, lineColor, maxDistance]);

  return (
    <div className="relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        style={{ willChange: 'transform' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
