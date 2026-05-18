export default function DashboardView() {
  return (
    <div className="text-white font-sans">
      <h1 className="text-3xl font-normal uppercase tracking-[4px] mb-12 text-white">
        Dolfin A.I
      </h1>

      {/* 3 Cards */}
      <div className="grid grid-cols-3 gap-8 mb-16">
        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">
            Net Worth
          </p>
          <p className="text-4xl font-normal text-white mt-4 tracking-[1px]">
            $1,248,502.92
          </p>
          <p className="text-[#cccccc] text-sm mt-2 tracking-wide">
            +2.4% / 24H
          </p>
        </div>
        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">
            Current APY
          </p>
          <p className="text-4xl font-normal text-white mt-4 tracking-[1px]">
            18.5%
          </p>
        </div>
        <div className="card-3d p-8">
          <p className="text-[#666666] text-xs font-mono uppercase tracking-[2px]">
            AI Rebalancing Status
          </p>
          <p className="text-2xl font-normal text-white mt-5 tracking-[2px] uppercase">
            Active
          </p>
          <p className="text-[#cccccc] text-sm mt-2 tracking-wide">
            Last rebalanced 4m ago
          </p>
        </div>
      </div>

      {/* AI Strategy Log */}
      <div className="card-3d p-8">
        <h2 className="text-sm font-normal text-[#cccccc] uppercase tracking-[3px] mb-8 border-b border-[#262626] pb-4">
          AI Strategy Log
        </h2>
        <div className="space-y-8">
          <div className="border-l border-white pl-6">
            <p className="text-white text-[11px] font-mono uppercase tracking-[2px]">
              Now
            </p>
            <p className="text-[#cccccc] font-serif text-lg leading-relaxed mt-2">
              AI rebalanced 50% USDC from Uniswap-Arb to Curve-OP to optimize
              yield by 1.8%.
            </p>
          </div>
          <div className="border-l border-[#3a3a3a] pl-6">
            <p className="text-[#666666] text-[11px] font-mono uppercase tracking-[2px]">
              2H Ago
            </p>
            <p className="text-[#999999] font-serif text-lg leading-relaxed mt-2">
              Detected liquidity shift in Polygon Aave pool. Preparing
              precautionary liquidity migration to GMX Arbitrum.
            </p>
          </div>
          <div className="border-l border-[#3a3a3a] pl-6">
            <p className="text-[#666666] text-[11px] font-mono uppercase tracking-[2px]">
              5H Ago
            </p>
            <p className="text-[#999999] font-serif text-lg leading-relaxed mt-2">
              Vault successfully executed delta-neutral hedging for ETH exposure
              across Binance and ByBit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
