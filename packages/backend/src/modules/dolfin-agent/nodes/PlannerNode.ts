import { buildAdapterCall } from "@dolfin/onchain";
import type { AdvisorState } from "../state.js";

// Encodes valid decisions into adapter calls. Aave actions need no quote or slippage,
// so quotedOut is unused here.
export class PlannerNode {
  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    const calls = (state.validDecisions ?? []).map((d) => buildAdapterCall(d, 0n));
    return { calls };
  };
}
