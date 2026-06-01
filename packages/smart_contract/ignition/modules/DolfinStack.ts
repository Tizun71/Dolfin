import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Canonical ERC-4337 v0.8 EntryPoint (same address across chains, incl. Arbitrum Sepolia).
const ENTRYPOINT_V08 = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";

/**
 * Deploys the Dolfin core stack:
 *   PolicyManager  ->  DolfinAccountFactory (which deploys the account implementation)
 *   + AaveV3Adapter (stateless protocol planner, owner-whitelisted per account).
 *
 * Params:
 *   entryPoint  - ERC-4337 EntryPoint (defaults to canonical v0.8)
 *   admin       - DEFAULT_ADMIN_ROLE on PolicyManager
 *   guardian    - GUARDIAN_ROLE (global pause + price feed) on PolicyManager
 *
 * Account creation, session config, and the price feed are applied by
 * `scripts/configure-session.ts` (runtime txs), not here.
 */
export default buildModule("DolfinStack", (m) => {
  const entryPoint = m.getParameter("entryPoint", ENTRYPOINT_V08);
  const admin = m.getParameter("admin", m.getAccount(0));
  const guardian = m.getParameter("guardian", m.getAccount(0));

  const policyManager = m.contract("PolicyManager", [admin, guardian]);
  const factory = m.contract("DolfinAccountFactory", [entryPoint, policyManager]);
  const aaveAdapter = m.contract("AaveV3Adapter", []);

  return { policyManager, factory, aaveAdapter };
});
