export default function Home() {
  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold uppercase tracking-widest mb-8">
        Your AI-Optimized Portfolio
      </h1>

      {/* 3 Cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Net Worth</p>
          <p className="text-3xl font-bold mt-2">$1,248,502.92</p>
          <p className="text-green-400 text-sm mt-1">+2.4% / 24H</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Current APY</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">18.5%</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
          <p className="text-gray-400 text-sm uppercase tracking-wider">AI Rebalancing Status</p>
          <p className="text-2xl font-bold text-green-400 mt-2">● ACTIVE</p>
          <p className="text-gray-500 text-sm mt-1">Last rebalanced 4m ago</p>
        </div>
      </div>

      {/* AI Strategy Log */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-4">AI Strategy Log</h2>
        <div className="space-y-4">
          <div className="border-l-2 border-blue-500 pl-4">
            <p className="text-gray-400 text-xs uppercase">Now</p>
            <p className="text-gray-300 mt-1">AI rebalanced 50% USDC from Uniswap-Arb to Curve-OP to optimize yield by 1.8%.</p>
          </div>
          <div className="border-l-2 border-gray-600 pl-4">
            <p className="text-gray-400 text-xs uppercase">2H Ago</p>
            <p className="text-gray-300 mt-1">Detected liquidity shift in Polygon Aave pool. Preparing precautionary liquidity migration to GMX Arbitrum.</p>
          </div>
          <div className="border-l-2 border-gray-600 pl-4">
            <p className="text-gray-400 text-xs uppercase">5H Ago</p>
            <p className="text-gray-300 mt-1">Vault successfully executed delta-neutral hedging for ETH exposure across Binance and ByBit.</p>
          </div>
        </div>
      </div>
    </div>
  );
}