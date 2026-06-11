"use client";

import Image from "next/image";
import { useSectionAnimation } from "./hooks/useSectionAnimation";

export default function FeaturesSection() {
  const { isVisible, sectionRef } = useSectionAnimation();

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-[#131313]">
      <div className="max-w-6xl mx-auto px-6">
      <div className={`text-center mb-24 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-yellow-300 text-sm font-mono font-semibold uppercase tracking-tight mb-4">
            Core Capabilities
          </p>
          <h2 className="text-5xl mb-6 uppercase tracking-tight font-mono font-semibold text-brand-gradient">
            Features That Empower
          </h2>
          <p className="text-base text-yellow-100/70 max-w-2xl mx-auto uppercase tracking-tight font-mono font-semibold leading-relaxed">
            ARIMA predictions. Flash loans. Atomic execution. Everything you need to trade smarter.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className={`col-span-12 lg:col-span-7 cyber-notch glass-card p-10 flex flex-col justify-end min-h-[400px] relative overflow-hidden group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}>
            <Image
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:scale-105 transition-transform duration-700"
              alt="Mechanical watch movement representing precision and automation"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5_x7j1uKqvL3Z3rBj9IxLHwuI_N_PHM-msY7wm1a0aSHuGghy7pNb4QSdogL7ShIzVdR9zZx4zNztswmhUKrq7tSp6oNvLTCCxyKBaDg88TSlM7_Nako5dJKoGnbO-sCyglaTjtknj-ZU6PtjxHcb6gPpSnegbpPiX2jL29ZKsAKACD4sccMSb16Loz37iH2Ogdtlotcdk-3KBoRTDlWe2MdDC_Cpkx3NiQ2We4ed4RT9LbORWN973PoLRFZCSRlHk0RvsMtFG2s"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <div className="relative z-10">
              <h3 className="text-2xl uppercase mb-4 tracking-tight font-mono font-semibold text-white">
                AI Market Prediction
              </h3>
              <p className="text-base text-yellow-100/70 max-w-md leading-relaxed">
                ARIMA algorithm analyzes market patterns. Predicts opportunities.
                Executes automatically when conditions align.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className={`cyber-notch glass-card p-8 flex-1 group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}>
              <h3 className="text-2xl uppercase mb-3 font-mono font-semibold tracking-tight text-white">
                Flash Loan Execution
              </h3>
              <p className="text-base text-yellow-100/70 leading-relaxed">
                Identify arbitrage. Execute instantly. No capital required.
                All automated within a single transaction.
              </p>
            </div>

            <div className={`cyber-notch glass-card p-8 flex-1 group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: isVisible ? "300ms" : "0ms" }}>
              <h3 className="text-2xl uppercase mb-3 font-mono font-semibold tracking-tight text-white">
                Real-Time Dashboard
              </h3>
              <p className="text-base text-yellow-100/70 leading-relaxed">
                Monitor predictions, trades, and your agent performance.
                See what ARIMA is analyzing. Always in control.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
