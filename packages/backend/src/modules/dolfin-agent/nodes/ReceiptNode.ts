import type { OnchainConfig } from "../config/onchain-config.js";
import type { AdvisorState } from "../state.js";

/**
 * Waits for each submitted UserOperation to be mined and confirms it did not revert.
 * Throws on revert so the run surfaces the on-chain failure instead of reporting success.
 */
export class ReceiptNode {
  constructor(private readonly cfg: OnchainConfig) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    for (const hash of state.userOpHashes ?? []) {
      await this.cfg.relayer.waitForReceipt(hash as `0x${string}`);
    }
    return {};
  };
}
