// TODO: Migrate this endpoint to Hono backend
import { createWalletClient, createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { DOLFIN_ABI } from "@/constants/abi";

const agentAccount = privateKeyToAccount(
  process.env.AGENT_PRIVATE_KEY as `0x${string}`,
);

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

const agentWallet = createWalletClient({
  account: agentAccount,
  chain: arbitrumSepolia,
  transport: http(),
});

export async function POST(req: Request) {
  try {
    const { userAddress, authorization } = await req.json();

    if (!userAddress || !authorization) {
      return Response.json(
        { error: "Missing userAddress or authorization" },
        { status: 400 },
      );
    }

    const rpcAuthorization = {
      address: authorization.contractAddress,
      chainId: authorization.chainId,
      nonce: authorization.nonce,
      r: authorization.r,
      s: authorization.s,
      yParity: authorization.yParity,
    };

    // Estimate gas với authorizationList
    const gasEstimate = await publicClient.estimateContractGas({
      address: userAddress,
      abi: DOLFIN_ABI,
      functionName: "initialize",
      account: agentAccount,
      authorizationList: [rpcAuthorization],
    });

    const txHash = await agentWallet.writeContract({
      address: userAddress,
      abi: DOLFIN_ABI,
      functionName: "initialize",
      authorizationList: [rpcAuthorization],
      // Thêm 50% buffer vì EIP-7702 delegation tốn thêm gas
      gas: (gasEstimate * BigInt(150)) / BigInt(100),
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return Response.json({ txHash });
  } catch (e: any) {
    console.error("[DOLFIN] Relay failed:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
