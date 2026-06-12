"use client";

import { useLayoutEffect, useRef, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem = ({ children, itemClassName = "" }: ScrollStackItemProps) => (
  <div className="scroll-stack-card-anchor relative w-full h-80 my-8 sm:my-10">
    <div
      className={`scroll-stack-card absolute inset-0 p-8 sm:p-12 rounded-3xl shadow-lg border border-neutral-900 box-border origin-top will-change-transform ${itemClassName}`.trim()}
      style={{
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  </div>
);

interface ScrollStackProps {
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
}

export default function ScrollStack({
  children,
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
}: ScrollStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(new Map<number, any>());
  const [isClient, setIsClient] = useState(false);

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(value as string);
    },
    []
  );

  const getElementOffset = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  }, []);

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    []
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length) return;

    const scrollTop = window.scrollY;
    const containerHeight = window.innerHeight;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = containerRef.current?.querySelector(".scroll-stack-end") as HTMLElement | null;
    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card || !card.parentElement) return;

      const anchor = card.parentElement;
      const anchorTop = getElementOffset(anchor);
      const triggerStart = anchorTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = anchorTop - scaleEndPositionPx;
      const pinStart = anchorTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount > 0) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCard = cardsRef.current[j];
          if (jCard?.parentElement) {
            const jAnchorTop = getElementOffset(jCard.parentElement);
            const jTriggerStart = jAnchorTop - stackPositionPx - itemStackDistance * j;
            if (scrollTop >= jTriggerStart) {
              topCardIndex = j;
            }
          }
        }
        if (i < topCardIndex) {
          blur = (topCardIndex - i) * blurAmount;
        }
      }

      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - anchorTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - anchorTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "none";

        card.style.transform = transform;
        card.style.filter = filter;
        lastTransformsRef.current.set(i, newTransform);
      }
    });
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    parsePercentage,
    getElementOffset,
    calculateProgress,
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useLayoutEffect(() => {
    if (!isClient) return;

    const cards = Array.from(
      containerRef.current?.querySelectorAll(".scroll-stack-card") ?? []
    ) as HTMLElement[];
    cardsRef.current = cards;

    cards.forEach((card, i) => {
      const anchor = card.parentElement;
      if (anchor && i < cards.length - 1) {
        anchor.style.marginBottom = `${itemDistance}px`;
      }

      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.perspective = "1000px";
    });

    updateCardTransforms();

    const handleScroll = () => updateCardTransforms();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      lastTransformsRef.current.clear();
    };
  }, [isClient, itemDistance, updateCardTransforms]);

  if (!isClient) return null;

  return (
    <div ref={containerRef} className="relative w-full overflow-visible">
      <div className="px-4 sm:px-6 lg:px-8 pt-0 pb-64">
        {children}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
}
