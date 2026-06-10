"use client";

import Image from "next/image";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-[120px] bg-[#131313]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="text-center mb-24">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#ffd700] mb-4">
            CORE CAPABILITIES
          </p>
          <h2 className="text-5xl mb-6 uppercase tracking-tight font-semibold">
            FEATURES THAT EMPOWER
          </h2>
          <p className="text-base text-[#c8c6c5] max-w-2xl mx-auto uppercase tracking-wider leading-relaxed">
            ARIMA predictions. Flash loans. Atomic execution. Everything you need to trade smarter.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 cyber-notch glass-card p-10 flex flex-col justify-end min-h-[400px] relative overflow-hidden group">
            <Image
              className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:scale-105 transition-transform duration-700"
              alt="Mechanical watch movement representing precision and automation"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5_x7j1uKqvL3Z3rBj9IxLHwuI_N_PHM-msY7wm1a0aSHuGghy7pNb4QSdogL7ShIzVdR9zZx4zNztswmhUKrq7tSp6oNvLTCCxyKBaDg88TSlM7_Nako5dJKoGnbO-sCyglaTjtknj-ZU6PtjxHcb6gPpSnegbpPiX2jL29ZKsAKACD4sccMSb16Loz37iH2Ogdtlotcdk-3KBoRTDlWe2MdDC_Cpkx3NiQ2We4ed4RT9LbORWN973PoLRFZCSRlHk0RvsMtFG2s"
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <div className="relative z-10">
              <h3 className="text-[32px] uppercase mb-4 tracking-[0.2em] font-semibold">
                AI Market Prediction
              </h3>
              <p className="text-lg text-[#c8c6c5] max-w-md leading-relaxed">
                ARIMA algorithm analyzes market patterns. Predicts opportunities.
                Executes automatically when conditions align.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="cyber-notch glass-card p-8 flex-1 group">
              <h3 className="text-xl uppercase mb-3 font-semibold tracking-wider">
                Flash Loan Execution
              </h3>
              <p className="text-base text-[#c8c6c5] leading-relaxed">
                Identify arbitrage. Execute instantly. No capital required.
                All automated within a single transaction.
              </p>
            </div>

            <div className="cyber-notch glass-card p-8 flex-1 group">
              <h3 className="text-xl uppercase mb-3 font-semibold tracking-wider">
                Real-Time Dashboard
              </h3>
              <p className="text-base text-[#c8c6c5] leading-relaxed">
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
