// Fund the Dolfin smart account from the owner EOA (gas + test USDC) on Arbitrum Sepolia.
//
//   pnpm -C packages/smart_contract fund-account
//
// Sends ETH (gas, since the account pays its own UserOp fees — no paymaster) and transfers
// USDC for the agent to supply. Get test USDC into the OWNER first via the Aave testnet
// faucet (app.aave.com → Arbitrum Sepolia → Faucet), then run this to move it to the account.
//
// Env (.env): PRIVATE_KEY (owner), ALCHEMY_RPC_URL. Amounts: FUND_ETH (def 0.01), FUND_USDC (def 100).

import "dotenv/config";
import { createPublicClient, createWalletClient, erc20Abi, formatEther, formatUnits, http, parseEther, parseUnits, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { AaveV3ArbitrumSepolia } from "@aave-dao/aave-address-book";

const ACCOUNT = "0xF1D11915cb461C9B2d375a69C0A969b78cFA9808" as Address;
const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;

const RPC = reqEnv("ALCHEMY_RPC_URL");
const owner = privateKeyToAccount(reqEnv("PRIVATE_KEY") as Hex);
const ethAmount = parseEther(process.env.FUND_ETH ?? "0.01");
const usdcAmount = parseUnits(process.env.FUND_USDC ?? "100", 6);

const pub = createPublicClient({ chain: arbitrumSepolia, transport: http(RPC) });
const wallet = createWalletClient({ account: owner, chain: arbitrumSepolia, transport: http(RPC) });

async function main() {
  console.log("owner  :", owner.address);
  console.log("account:", ACCOUNT);

  // 1. ETH for gas
  const accEth = await pub.getBalance({ address: ACCOUNT });
  if (accEth < ethAmount) {
    const ownerEth = await pub.getBalance({ address: owner.address });
    if (ownerEth < ethAmount) throw new Error(`owner ETH ${formatEther(ownerEth)} < ${formatEther(ethAmount)} — top up owner from an Arb Sepolia faucet`);
    console.log(`sending ${formatEther(ethAmount)} ETH → account...`);
    await wait(await wallet.sendTransaction({ to: ACCOUNT, value: ethAmount }));
  } else {
    console.log(`account already has ${formatEther(accEth)} ETH — skip`);
  }

  // 2. USDC to supply
  const accUsdc = (await pub.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [ACCOUNT] })) as bigint;
  if (accUsdc < usdcAmount) {
    const ownerUsdc = (await pub.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [owner.address] })) as bigint;
    if (ownerUsdc < usdcAmount) {
      throw new Error(`owner USDC ${formatUnits(ownerUsdc, 6)} < ${formatUnits(usdcAmount, 6)} — mint test USDC to the owner via the Aave faucet first`);
    }
    console.log(`transferring ${formatUnits(usdcAmount, 6)} USDC → account...`);
    await wait(await wallet.writeContract({ address: USDC, abi: erc20Abi, functionName: "transfer", args: [ACCOUNT, usdcAmount] }));
  } else {
    console.log(`account already has ${formatUnits(accUsdc, 6)} USDC — skip`);
  }

  const ethNow = await pub.getBalance({ address: ACCOUNT });
  const usdcNow = (await pub.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [ACCOUNT] })) as bigint;
  console.log(`\n=== funded ===\naccount ETH : ${formatEther(ethNow)}\naccount USDC: ${formatUnits(usdcNow, 6)}`);
}

function reqEnv(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`missing env: ${k}`);
  return v;
}

async function wait(hash: Hex) {
  const r = await pub.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error(`tx reverted: ${hash}`);
  console.log("  tx:", hash);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
