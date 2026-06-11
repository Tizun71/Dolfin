"use client";

import { useSectionAnimation } from "./hooks/useSectionAnimation";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import { Cpu, Coins, Zap, Layers } from "lucide-react";

export default function WhySection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section id="why-dolfin" ref={sectionRef} className="relative z-10 px-6 py-24 bg-[#131313]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-yellow-300 text-sm font-mono font-semibold uppercase tracking-tight mb-4">
            The Dolfin Advantage
          </p>
          <h2 className="text-5xl mb-6 uppercase tracking-tight font-mono font-semibold text-brand-gradient">
            Why Dolfin?
          </h2>
          <p className="text-yellow-100/70 text-base md:text-lg font-mono font-semibold uppercase tracking-tight max-w-2xl mx-auto leading-relaxed">
            Smart market predictions. Automated arbitrage. No capital risk. Non-custodial.
          </p>
        </div>

        {/* Scroll Stack Container */}
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
        >
          <div className="mb-6 flex items-center justify-center gap-2 bg-neutral-900/40 border border-yellow-500/20 px-4 py-2 rounded-full w-fit mx-auto backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500" />
            </span>
            <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase font-semibold">
              Scroll to explore the modules
            </span>
          </div>

          <ScrollStack
            itemDistance={100}
            itemScale={0.035}
            itemStackDistance={32}
            stackPosition="20%"
            scaleEndPosition="10%"
            baseScale={0.86}
            rotationAmount={-1.5}
            blurAmount={1.2}
          >
            {/* Card 1 */}
            <ScrollStackItem itemClassName="bg-[#0f0f0f] border border-yellow-500/20 rounded-2xl flex flex-col justify-between py-6 px-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-wider text-yellow-400 font-semibold uppercase">
                    Model 01 • Cognitive Core
                  </span>
                  <Cpu className="w-5 h-5 text-yellow-500/80" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-2 uppercase">
                  AI-Powered Predictions
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed mt-1">
                  Advanced machine learning analyzes orderbook data across DEXs to forecast price movements 1-2 blocks ahead, enabling secure automated execution.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-yellow-500/20 pt-4 text-neutral-500 font-mono text-[10px]">
                <span>Confidence: 94.2%</span>
                <span className="text-yellow-500/80 font-semibold">Core</span>
              </div>
            </ScrollStackItem>

            {/* Card 2 */}
            <ScrollStackItem itemClassName="bg-[#0d0d0d] border border-yellow-500/20 rounded-2xl flex flex-col justify-between py-6 px-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-wider text-yellow-400 font-semibold uppercase">
                    Model 02 • Atomic Leverage
                  </span>
                  <Coins className="w-5 h-5 text-yellow-500/80" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-2 uppercase">
                  Flash Loans Without Capital
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed mt-1">
                  Access uncollateralized credit pools across major lending protocols. Trade multi-asset arbitrage using flash contracts with zero upfront funds.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-yellow-500/20 pt-4 text-neutral-500 font-mono text-[10px]">
                <span>Max Leverage: $250K</span>
                <span className="text-yellow-500/80 font-semibold">Risk-Isolated</span>
              </div>
            </ScrollStackItem>

            {/* Card 3 */}
            <ScrollStackItem itemClassName="bg-[#0f0f0f] border border-yellow-500/20 rounded-2xl flex flex-col justify-between py-6 px-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-wider text-yellow-400 font-semibold uppercase">
                    Model 03 • Decentralized Trust
                  </span>
                  <Zap className="w-5 h-5 text-yellow-500/80" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-2 uppercase">
                  Atomic Reverts & Safety
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed mt-1">
                  If any arbitrage leg fails due to slippage or gas constraints, the entire transaction reverts atomically. Your assets are always secure.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-yellow-500/20 pt-4 text-neutral-500 font-mono text-[10px]">
                <span>Safety: 100% Secured</span>
                <span className="text-green-400/80 font-semibold">Automated</span>
              </div>
            </ScrollStackItem>

            {/* Card 4 */}
            <ScrollStackItem itemClassName="bg-[#0d0d0d] border border-yellow-500/20 rounded-2xl flex flex-col justify-between py-6 px-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-wider text-yellow-400 font-semibold uppercase">
                    Model 04 • Speed Advantage
                  </span>
                  <Layers className="w-5 h-5 text-yellow-500/80" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight mt-2 uppercase">
                  Arbitrum Optimization
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed mt-1">
                  Built natively for Arbitrum's ultra-low latency rollups. Transactions confirm in under 1 second with 98% lower gas fees than mainnet.
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-yellow-500/20 pt-4 text-neutral-500 font-mono text-[10px]">
                <span>Speed: &lt;1s Settlement</span>
                <span className="text-yellow-500/80 font-semibold">L2 Native</span>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </div>
    </section>
  );
}
