import type { OnchainConfig } from "../config/onchain-config.js";
import type { AdvisorState } from "../state.js";

/**
 * Submits encoded calls to the Alchemy bundler via the session-key relayer (autonomous full).
 * Idempotent: skips if this run already produced userOpHashes, to avoid double-submission on
 * graph retries. Safety is bounded entirely by the on-chain PolicyManager.
 */
export class ExecutorNode {
  constructor(private readonly cfg: OnchainConfig) {}

  execute = async (state: AdvisorState): Promise<Partial<AdvisorState>> => {
    if (state.userOpHashes && state.userOpHashes.length > 0) return {};

    const userOpHashes: string[] = [];
    for (const call of state.calls ?? []) {
      userOpHashes.push(await this.cfg.relayer.submit(call));
    }
    return { userOpHashes };
  };
}
