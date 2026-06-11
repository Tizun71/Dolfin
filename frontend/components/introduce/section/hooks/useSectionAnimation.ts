"use client";

import { useEffect, useRef, useState } from "react";

let sharedObserver: IntersectionObserver | null = null;

export function useSectionAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Create shared observer instance if it doesn't exist
    if (!sharedObserver) {
      sharedObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.target instanceof HTMLElement) {
            const isIntersecting = entry.isIntersecting;
            (entry.target as any).__isVisible = isIntersecting;
            // Trigger state update if this element has observers
            if ((entry.target as any).__setIsVisible) {
              (entry.target as any).__setIsVisible(isIntersecting);
            }
          }
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        },
      );
    }

    if (sectionRef.current) {
      // Attach state setter to element for callback
      (sectionRef.current as any).__setIsVisible = setIsVisible;
      sharedObserver.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        sharedObserver?.unobserve(sectionRef.current);
        delete (sectionRef.current as any).__setIsVisible;
      }
    };
  }, []);

  return { isVisible, sectionRef };
}
