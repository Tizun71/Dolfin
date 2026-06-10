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
              <div className="w-14 h-14 bg-[#ffd700] flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-[#221b00]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-[32px] uppercase mb-4 tracking-[0.2em] font-semibold">
                AI Market Prediction
              </h3>
              <p className="text-lg text-[#c8c6c5] max-w-md leading-relaxed">
                ARIMA algorithm analyzes market patterns. Predicts opportunities.
                Executes automatically when conditions align.
              </p>
            </div>
            <div className="absolute top-8 right-8 text-[64px] opacity-5 text-[#ffd700] font-bold pointer-events-none">
              01
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="cyber-notch glass-card p-8 flex-1 group">
              <div className="flex justify-between items-start mb-4">
                <svg
                  className="w-8 h-8 text-[#ffd700]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="font-mono text-sm text-[#ffd700]/30">02</span>
              </div>
              <h3 className="text-xl uppercase mb-3 font-semibold tracking-wider">
                Flash Loan Execution
              </h3>
              <p className="text-base text-[#c8c6c5] leading-relaxed">
                Identify arbitrage. Execute instantly. No capital required.
                All automated within a single transaction.
              </p>
            </div>

            <div className="cyber-notch glass-card p-8 flex-1 group">
              <div className="flex justify-between items-start mb-4">
                <svg
                  className="w-8 h-8 text-[#ffd700]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="font-mono text-sm text-[#ffd700]/30">03</span>
              </div>
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
