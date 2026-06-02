"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ArtificialHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const grainCanvas = grainCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const grainCtx = grainCanvas.getContext("2d")!;

    const density = " .:-=+*#%@";

    const params = {
      rotation: 0,
      atmosphereShift: 0,
      glitchIntensity: 0,
      glitchFrequency: 0,
    };

    gsap.to(params, {
      rotation: Math.PI * 2,
      duration: 20,
      repeat: -1,
      ease: "none",
    });
    gsap.to(params, {
      atmosphereShift: 1,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.to(params, {
      glitchIntensity: 1,
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      repeatDelay: Math.random() * 3 + 1,
    });
    gsap.to(params, {
      glitchFrequency: 1,
      duration: 0.05,
      repeat: -1,
      yoyo: true,
      ease: "none",
    });

    const generateFilmGrain = (
      width: number,
      height: number,
      intensity = 0.15,
    ) => {
      const imageData = grainCtx.createImageData(width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * intensity * 255;
        data[i] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 1] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 2] = Math.max(0, Math.min(255, 128 + grain));
        data[i + 3] = Math.abs(grain) * 3;
      }
      return imageData;
    };

    const drawGlitchedOrb = (
      centerX: number,
      centerY: number,
      radius: number,
      time: number,
      glitchIntensity: number,
    ) => {
      ctx.save();

      const shouldGlitch = Math.random() < 0.1 && glitchIntensity > 0.5;
      const glitchOffset = shouldGlitch
        ? (Math.random() - 0.5) * 20 * glitchIntensity
        : 0;
      const glitchScale = shouldGlitch
        ? 1 + (Math.random() - 0.5) * 0.3 * glitchIntensity
        : 1;

      if (shouldGlitch) {
        ctx.translate(glitchOffset, glitchOffset * 0.8);
        ctx.scale(glitchScale, 1 / glitchScale);
      }

      // Brand gold hue: 40~50 = vàng cam (#fbbf24 → #f97316)
      const hue = 40 + params.atmosphereShift * 15; // 40~55

      const orbGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius * 1.5,
      );
      orbGradient.addColorStop(0, `hsla(${hue + 10}, 100%, 92%, 0.95)`);
      orbGradient.addColorStop(0.2, `hsla(${hue + 5}, 95%, 70%, 0.75)`);
      orbGradient.addColorStop(0.5, `hsla(${hue - 5}, 90%, 45%, 0.45)`);
      orbGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = orbGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bright center
      const centerRadius = radius * 0.3;
      ctx.fillStyle = `hsla(${hue + 15}, 100%, 95%, 0.85)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();

      if (shouldGlitch) {
        ctx.globalCompositeOperation = "screen";

        // Glitch: orange channel
        ctx.fillStyle = `hsla(25, 100%, 60%, ${0.5 * glitchIntensity})`;
        ctx.beginPath();
        ctx.arc(
          centerX + glitchOffset * 0.5,
          centerY,
          centerRadius,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Glitch: yellow channel
        ctx.fillStyle = `hsla(55, 100%, 60%, ${0.5 * glitchIntensity})`;
        ctx.beginPath();
        ctx.arc(
          centerX - glitchOffset * 0.5,
          centerY,
          centerRadius,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 * glitchIntensity})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = centerY - radius + Math.random() * radius * 2;
          const startX = centerX - radius + Math.random() * 20;
          const endX = centerX + radius - Math.random() * 20;
          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(249, 115, 22, ${0.4 * glitchIntensity})`;
        for (let i = 0; i < 3; i++) {
          const blockX = centerX - radius + Math.random() * radius * 2;
          const blockY = centerY - radius + Math.random() * radius * 2;
          const blockSize = Math.random() * 10 + 2;
          ctx.fillRect(blockX, blockY, blockSize, blockSize);
        }
      }

      // Outer ring
      ctx.strokeStyle = `hsla(${hue + 10}, 90%, 65%, 0.6)`;
      ctx.lineWidth = 2;

      if (shouldGlitch) {
        const segments = 8;
        for (let i = 0; i < segments; i++) {
          const startAngle = (i / segments) * Math.PI * 2;
          const endAngle = ((i + 1) / segments) * Math.PI * 2;
          const ringRadius =
            radius * 1.2 + (Math.random() - 0.5) * 10 * glitchIntensity;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (shouldGlitch && Math.random() < 0.3) {
        ctx.globalCompositeOperation = "difference";
        ctx.fillStyle = `rgba(251, 191, 36, ${0.6 * glitchIntensity})`;
        for (let i = 0; i < 3; i++) {
          const barY = centerY - radius + Math.random() * radius * 2;
          const barHeight = Math.random() * 5 + 1;
          ctx.fillRect(centerX - radius, barY, radius * 2, barHeight);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.restore();
    };

    function render() {
      timeRef.current += 0.016;
      const time = timeRef.current;

      const width = (canvas.width = grainCanvas.width = window.innerWidth);
      const height = (canvas.height = grainCanvas.height = window.innerHeight);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.2;

      // Brand gold atmospheric background
      const hue = 40 + params.atmosphereShift * 15;
      const bgGradient = ctx.createRadialGradient(
        centerX,
        centerY - 50,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.8,
      );
      bgGradient.addColorStop(0, `hsla(${hue + 5}, 95%, 45%, 0.3)`);
      bgGradient.addColorStop(0.3, `hsla(${hue - 5}, 80%, 28%, 0.2)`);
      bgGradient.addColorStop(0.6, `hsla(${hue - 15}, 60%, 12%, 0.12)`);
      bgGradient.addColorStop(1, "rgba(0, 0, 0, 0.92)");

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      drawGlitchedOrb(centerX, centerY, radius, time, params.glitchIntensity);

      // ASCII sphere — màu vàng cam
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const spacing = 9;
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);

      for (let i = 0; i < cols && i < 150; i++) {
        for (let j = 0; j < rows && j < 100; j++) {
          const x = (i - cols / 2) * spacing + centerX;
          const y = (j - rows / 2) * spacing + centerY;

          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius && Math.random() > 0.4) {
            const z = Math.sqrt(
              Math.max(0, radius * radius - dx * dx - dy * dy),
            );
            const angle = params.rotation;
            const rotZ = dx * Math.sin(angle) + z * Math.cos(angle);
            const brightness = (rotZ + radius) / (radius * 2);

            if (rotZ > -radius * 0.3) {
              const charIndex = Math.floor(brightness * (density.length - 1));
              let char = density[charIndex];

              if (
                dist < radius * 0.8 &&
                params.glitchIntensity > 0.8 &&
                Math.random() < 0.3
              ) {
                const glitchChars = ["█", "▓", "▒", "░", "▄", "▀", "■", "□"];
                char =
                  glitchChars[Math.floor(Math.random() * glitchChars.length)];
              }

              const alpha = Math.max(0.2, brightness);
              // ASCII chars màu vàng cam
              ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
              ctx.fillText(char, x, y);
            }
          }
        }
      }

      // Film grain
      grainCtx.clearRect(0, 0, width, height);
      const grainIntensity = 0.22 + Math.sin(time * 10) * 0.03;
      const grainImageData = generateFilmGrain(width, height, grainIntensity);
      grainCtx.putImageData(grainImageData, 0, 0);

      if (params.glitchIntensity > 0.5) {
        grainCtx.globalCompositeOperation = "screen";
        for (let i = 0; i < 200; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 3 + 0.5;
          const opacity = Math.random() * 0.5 * params.glitchIntensity;
          grainCtx.fillStyle = `rgba(251, 191, 36, ${opacity})`;
          grainCtx.beginPath();
          grainCtx.arc(x, y, size, 0, Math.PI * 2);
          grainCtx.fill();
        }
      }

      grainCtx.globalCompositeOperation = "screen";
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 0.5;
        const opacity = Math.random() * 0.3;
        grainCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        grainCtx.beginPath();
        grainCtx.arc(x, y, size, 0, Math.PI * 2);
        grainCtx.fill();
      }

      grainCtx.globalCompositeOperation = "multiply";
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.5 + 0.5;
        grainCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        grainCtx.beginPath();
        grainCtx.arc(x, y, size, 0, Math.PI * 2);
        grainCtx.fill();
      }

      frameRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#000",
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <canvas
        ref={grainCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          mixBlendMode: "overlay",
          opacity: 0.6,
        }}
      />
    </div>
  );
};
