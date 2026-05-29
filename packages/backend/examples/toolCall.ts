import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { checkUserEligibility } from "../src/modules/ai/tools.js";
import { dolFinABI } from "../src/modules/ai/services.js";
import { type Address, createPublicClient, createWalletClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAddress } from "viem/accounts";

// Dùng tool
async function main() {
  const response = await generateText({
    model: google("gemini-2.0-flash"),
    tools: {
      checkUserEligibility,
    },
    system: `You are a powerful AI assistant of Dolfin, a autonomous agent that helps users invest in DeFi.
The system has a smart contract called DolfinAccount that users want to use Dolfin have to EIP-7702 delegate to the DolfinAccount and already add the address of the Dolfin agent to the whitelist.`,
    prompt:
      "Can the user with address '0x8173912a21AA42C64f824F92086E556C3B2B8256' use Dolfin agent?",
  });
  return response.text;
}

let res = await main();
console.log(res);

async function setupAccount(userPrivateKey: string, agentPrivateKey: string) {
  const userWallet = createWalletClient({
    account: userPrivateKey as Address,
    chain: arbitrumSepolia,
    transport: http(),
  });
  const agentWallet = createWalletClient({
    account: agentPrivateKey as Address,
    chain: arbitrumSepolia,
    transport: http(),
  });
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(),
  });

  const authorization = await userWallet.signAuthorization({
    account: userPrivateKey as Address,
    contractAddress: process.env.DOLFIN_ACCOUNT_ADDRESS as Address,
    executor: "self",
  });

  const txHash = await agentWallet.writeContract({
    address: privateKeyToAddress(userPrivateKey as Address),
    abi: dolFinABI,
    functionName: "initialize",
    authorizationList: [authorization],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  // Add agent to whitelist
  const whitelistTxHash = await userWallet.writeContract({
    address: privateKeyToAddress(userPrivateKey as Address),
    abi: dolFinABI,
    functionName: "addToWhitelist",
    args: [privateKeyToAddress(agentPrivateKey as Address)],
  });

  await publicClient.waitForTransactionReceipt({ hash: whitelistTxHash });

  console.log("Account setup complete");
}

await setupAccount(process.env.USER_PRIVATE_KEY as string, process.env.AGENT_PRIVATE_KEY as string);

res = await main();
console.log(res);

// Chạy file với tsx: pnpm tsx --env-file=.env examples/toolCall.ts
