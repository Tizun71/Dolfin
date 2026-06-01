import {
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  HandCoins,
  Undo2,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { ActionType } from "@/constants/dolfin";

// Lucide icon per protocol action type (shared by the permissions selector + breakdown).
export const ACTION_ICONS: Record<ActionType, LucideIcon> = {
  [ActionType.SWAP]: ArrowLeftRight,
  [ActionType.SUPPLY]: ArrowDownToLine,
  [ActionType.WITHDRAW]: ArrowUpFromLine,
  [ActionType.BORROW]: HandCoins,
  [ActionType.REPAY]: Undo2,
  [ActionType.OPEN_PERP]: TrendingUp,
  [ActionType.CLOSE_PERP]: TrendingDown,
};
