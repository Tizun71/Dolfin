type StrategyStatus = "running" | "completed" | "stopped";

interface HistoryItem {
  asset: string;
  name: string;
  icon: string;
  color: string;
  apy: number;
  totalSupplied: string;
  status: StrategyStatus;
  startedAt: string;
}
