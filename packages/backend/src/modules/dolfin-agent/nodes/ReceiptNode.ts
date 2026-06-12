import type { OnchainConfig } from "../config/onchain-config.js";
import type { AdvisorState } from "../state.js";

// Waits for each UserOperation to be mined and captures its tx hash. Throws on revert so
// the run surfaces the on-chain failure instead of reporting success.
export class ReceiptNode {
  constructor(private readonly cfg: OnchainConfig) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    if (state.transactions && state.transactions.length > 0) return {};
    const transactions: `0x${string}`[] = [];
    for (const hash of state.userOpHashes ?? []) {
      const receipt = await this.cfg.relayer.waitForReceipt(hash as `0x${string}`);
      if (receipt.receipt?.transactionHash) {
        transactions.push(receipt.receipt.transactionHash);
      }
    }
    return { transactions };
  };
}
