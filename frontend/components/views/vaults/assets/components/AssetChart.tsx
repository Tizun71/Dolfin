"use client";

interface AssetChartProps {
  symbol: string;
  color: string;
  w: number;
  h: number;
  chartData: number[];
  minVal: number;
  maxVal: number;
  avgApr: string;
}

export default function AssetChart({
  symbol,
  color,
  w,
  h,
  chartData,
  minVal,
  maxVal,
  avgApr,
}: AssetChartProps) {
  function toY(val: number) {
    return h - ((val - minVal) / (maxVal - minVal)) * h;
  }

  const points = chartData
    .map((v, i) => `${(i / (chartData.length - 1)) * w},${toY(v)}`)
    .join(" ");

  const avgY = toY(parseFloat(avgApr));

  return (
    <div className="bg-[#080808] border border-[#111] p-4">
      <svg
        viewBox={`0 0 ${w} ${h + 10}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: "130px" }}
      >
        <defs>
          <linearGradient id={`fill-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={avgY}
          x2={w}
          y2={avgY}
          stroke="#2a2a2a"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text x="8" y={avgY - 5} fill="#555" fontSize="11" fontFamily="monospace">
          Avg {avgApr}%
        </text>
        <polygon
          points={`0,${h} ${points} ${w},${h}`}
          fill={`url(#fill-${symbol})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}
