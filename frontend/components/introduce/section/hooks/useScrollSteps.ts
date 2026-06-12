"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-driven stepper. Maps how far the user has scrolled through a tall
 * container into a discrete active step (0..stepCount-1) plus a continuous
 * 0..1 progress value. Pair with a `sticky` inner element to pin the visual
 * while scrolling advances the steps.
 */
export function useScrollSteps(stepCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const compute = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = el.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);
      const step = Math.min(stepCount - 1, Math.max(0, Math.floor(p * stepCount)));
      setActiveStep(step);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [stepCount]);

  return { containerRef, activeStep, progress };
}
