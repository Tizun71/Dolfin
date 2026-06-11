//   1. create the user's ERC-4337 smart account (CREATE2, idempotent)
//   2. guardian sets the USD price for USDC (else PolicyManager.valueUsd reverts PriceUnset)
//   3. owner grants a scoped session to the AI key: policy + Aave adapter + USDC + action mask
//

import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  http,
  getContract,
  parseUnits,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { AaveV3ArbitrumSepolia } from "@aave-dao/aave-address-book";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// --- env ---
const RPC = reqEnv("ALCHEMY_RPC_URL");
const owner = privateKeyToAccount(reqEnv("PRIVATE_KEY") as Hex);
const sessionKey = privateKeyToAccount(reqEnv("SESSION_KEY") as Hex).address;
const salt = BigInt(process.env.ACCOUNT_SALT ?? "0");

// --- on-chain constants (Aave V3 Arbitrum Sepolia) ---
const POOL = AaveV3ArbitrumSepolia.POOL as Address;
const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;
// SUPPLY|WITHDRAW|BORROW|REPAY = bits 1..4 = (1<<1)|(1<<2)|(1<<3)|(1<<4)
const AAVE_ACTION_MASK = (1n << 1n) | (1n << 2n) | (1n << 3n) | (1n << 4n); // = 30

// --- demo policy (USD scaled to 1e18, matching PolicyManager.valueUsd) ---
const usd = (v: string | number) => parseUnits(String(v), 18);
const expiry = BigInt(Math.floor(Date.now() / 1000) + Number(process.env.POLICY_EXPIRY_DAYS ?? 7) * 86_400);
const policy = {
  expiry,
  maxTradePerTx: usd(process.env.POLICY_MAX_TRADE_USD ?? 1000),
  maxDailyVolume: usd(process.env.POLICY_MAX_DAILY_USD ?? 5000),
  maxExposure: usd(process.env.POLICY_MAX_EXPOSURE_USD ?? 5000),
  maxLossPerDay: usd(process.env.POLICY_MAX_LOSS_PER_DAY_USD ?? 500),
  maxDrawdownBps: 5000,
  maxLeverageBps: 10_000,
  exists: true,
  paused: false,
} as const;

async function main() {
  const addrs = readDeployedAddresses();
  const policyManagerAddr = pick(addrs, "PolicyManager");
  const factoryAddr = pick(addrs, "DolfinAccountFactory");
  const aaveAdapterAddr = pick(addrs, "AaveV3Adapter");

  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(RPC) });
  const walletClient = createWalletClient({ account: owner, chain: arbitrumSepolia, transport: http(RPC) });

  const factory = getContract({ address: factoryAddr, abi: abiOf("DolfinAccountFactory"), client: { public: publicClient, wallet: walletClient } });
  const policyManager = getContract({ address: policyManagerAddr, abi: abiOf("PolicyManager"), client: { public: publicClient, wallet: walletClient } });

  // 1. smart account (idempotent: createAccount is a no-op if already deployed)
  const account = (await factory.read.getAddress([owner.address, salt])) as Address;
  const code = await publicClient.getCode({ address: account });
  if (!code || code === "0x") {
    console.log(`creating account for owner ${owner.address} (salt ${salt})...`);
    await send(walletClient, publicClient, factory.write.createAccount([owner.address, salt]));
  }
  console.log("smart account:", account);

  // 2. guardian price feed (USDC = $1.00, 1e18)
  await send(walletClient, publicClient, policyManager.write.setPrice([USDC, usd(1)]));
  console.log("price set: USDC = $1");

  // 3. owner grants the session (policy + adapter + token + Aave action mask)
  const dolfinAccount = getContract({ address: account, abi: abiOf("DolfinSmartAccount"), client: { public: publicClient, wallet: walletClient } });
  await send(
    walletClient,
    publicClient,
    dolfinAccount.write.configureSession([
      sessionKey,
      Number(expiry),
      policy,
      [aaveAdapterAddr],
      [USDC],
      [{ protocol: POOL, actionMask: AAVE_ACTION_MASK }],
    ]),
  );

  console.log("\n=== session configured ===");
  console.log("account     :", account);
  console.log("sessionKey  :", sessionKey);
  console.log("aaveAdapter :", aaveAdapterAddr);
  console.log("pool        :", POOL);
  console.log("USDC        :", USDC);
  console.log("\nNext: fund the smart account with Arb Sepolia ETH (gas) + test USDC, then run the agent.");
}

// --- helpers ---
function reqEnv(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`missing env: ${k} (see .env.example)`);
  return v;
}

function readDeployedAddresses(): Record<string, string> {
  const chainId = arbitrumSepolia.id;
  const path = resolve(root, `ignition/deployments/chain-${chainId}/deployed_addresses.json`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`no deployment found at ${path}, run the DolfinStack deploy first`);
  }
}

function pick(addrs: Record<string, string>, contract: string): Address {
  const key = Object.keys(addrs).find((k) => k.endsWith(`#${contract}`));
  if (!key) throw new Error(`${contract} not in deployed_addresses.json, redeploy DolfinStack`);
  return addrs[key] as Address;
}

function abiOf(contract: string) {
  const map: Record<string, string> = {
    DolfinAccountFactory: "contracts/dolfin/DolfinAccountFactory.sol/DolfinAccountFactory.json",
    PolicyManager: "contracts/dolfin/PolicyManager.sol/PolicyManager.json",
    DolfinSmartAccount: "contracts/dolfin/DolfinSmartAccount.sol/DolfinSmartAccount.json",
  };
  const artifact = JSON.parse(readFileSync(resolve(root, "artifacts", map[contract]), "utf8"));
  return artifact.abi;
}

async function send(wallet: ReturnType<typeof createWalletClient>, pub: ReturnType<typeof createPublicClient>, txPromise: Promise<Hex>) {
  const hash = await txPromise;
  const receipt = await pub.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error(`tx reverted: ${hash}`);
  return hash;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
