"use client";

import { useSectionAnimation } from "./hooks/useSectionAnimation";
import { useEffect, useState } from "react";

const STATS = [
  { label: "Total Value Locked", value: 2500000 },
  { label: "Active Agents", value: 1200 },
  { label: "24h Volume", value: 15000000 },
];

const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setHasStarted(true);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | undefined;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setDisplayValue(Math.floor(value * progress));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(value);
    };
    requestAnimationFrame(animate);
  }, [value, duration, hasStarted]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return <span>{formatNumber(displayValue)}</span>;
};

export default function TrustSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section ref={sectionRef} className="relative z-10 bg-[#131313] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: isVisible ? `${index * 80}ms` : "0ms" }}
            >
              <p className="text-base text-[#888] uppercase tracking-tight font-mono font-semibold mb-3">{stat.label}</p>
              <p className="text-4xl font-mono font-semibold text-yellow-300">
                <AnimatedNumber value={stat.value} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

