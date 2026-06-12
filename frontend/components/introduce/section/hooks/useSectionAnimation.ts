"use client";

import { useEffect, useRef, useState } from "react";

const observerMap = new WeakMap<HTMLElement, (visible: boolean) => void>();

function getSharedObserver() {
  // Create a new observer for each component to avoid stale closures
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target instanceof HTMLElement) {
          const callback = observerMap.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );
}

let globalObserver: IntersectionObserver | null = null;

export function useSectionAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Initialize global observer once
    if (!globalObserver) {
      globalObserver = getSharedObserver();
    }

    if (sectionRef.current) {
      // Store the setState callback in the map
      observerMap.set(sectionRef.current, setIsVisible);
      globalObserver.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current && globalObserver) {
        globalObserver.unobserve(sectionRef.current);
        observerMap.delete(sectionRef.current);
      }
    };
  }, []);

  return { isVisible, sectionRef };
}
