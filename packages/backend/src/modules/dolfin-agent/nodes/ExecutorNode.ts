import type { OnchainConfig } from "../config/onchain-config.js";
import type { AdvisorState } from "../state.js";

// Submits encoded calls to the bundler via the session-key relayer. Idempotent: skips if
// this run already produced userOpHashes, to avoid double-submission on graph retries.
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
