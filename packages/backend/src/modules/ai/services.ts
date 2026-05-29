import { AaveV3ArbitrumSepolia } from "@aave-dao/aave-address-book";
import { getArbitrumMarketData } from "../aave/services.js";
import {
  encodeFunctionData,
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  type Address,
} from "viem";
import { privateKeyToAccount, privateKeyToAddress } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

export const dolFinABI = [
  {
    inputs: [],
    name: "AlreadyWhitelisted",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "returnData",
        type: "bytes",
      },
    ],
    name: "CallFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "NotWhitelisted",
    type: "error",
  },
  {
    inputs: [],
    name: "UnauthorizedCaller",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "CallExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerRemovedFromWhitelist",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "CallerWhitelisted",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "addToWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DolfinAccount.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct DolfinAccount.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "executeDirect",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "isWhitelisted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "removeFromWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

export const flashLoanSimpleAbi = [
  {
    type: "function",
    name: "flashLoanSimple",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "receiverAddress",
        type: "address",
      },
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "params",
        type: "bytes",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
    ],
    outputs: [],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
] as const;

export const swapRouterAbi = [
  {
    type: "function",
    name: "exactInputSingle",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          {
            name: "tokenIn",
            type: "address",
          },
          {
            name: "tokenOut",
            type: "address",
          },
          {
            name: "fee",
            type: "uint24",
          },
          {
            name: "recipient",
            type: "address",
          },
          {
            name: "amountIn",
            type: "uint256",
          },
          {
            name: "amountOutMinimum",
            type: "uint256",
          },
          {
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "amountOut",
        type: "uint256",
      },
    ],
  },
] as const;

export const supplyAbi = [
  {
    type: "function",
    name: "supply",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
    ],
    outputs: [],
  },
] as const;

export const borrowAbi = [
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "interestRateMode",
        type: "uint256",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
    ],
    outputs: [],
  },
] as const;

export const repayAbi = [
  {
    type: "function",
    name: "repay",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "asset",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
      {
        name: "interestRateMode",
        type: "uint256",
      },
      {
        name: "onBehalfOf",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
] as const;

export const wethAbi = [
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [],
  },
] as const;

export const wethGatewayAbi = [
  {
    type: "function",
    name: "depositETH",
    stateMutability: "payable",
    inputs: [
      {
        name: "onBehalfOf",
        type: "address",
      },
      {
        name: "referralCode",
        type: "uint16",
      },
    ],
    outputs: [],
  },
] as const;

export const UNISWAP_SWAP_ROUTER_02 = "0x101F443B4d1b059569D643917553c771E1b9663E";

export const agentWallet = createWalletClient({
  account: privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as Address),
  chain: arbitrumSepolia,
  transport: http(),
});

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

const AAVE_FLASH_LOAN_PREMIUM_ABI = [
  {
    type: "function",
    name: "FLASHLOAN_PREMIUM_TOTAL",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint128" }],
  },
] as const;

export async function isAgentWhitelisted(user: Address): Promise<boolean> {
  const agentWalletAddress = privateKeyToAddress(process.env.AGENT_PRIVATE_KEY as Address);

  try {
    const isWhitelisted = (await publicClient.readContract({
      address: user,
      abi: dolFinABI,
      functionName: "isWhitelisted",
      args: [agentWalletAddress],
    })) as boolean;

    return isWhitelisted;
  } catch (error) {
    return false;
  }
}

export async function hasDelegatedToDolfinAccount(user: Address): Promise<boolean> {
  const dolFinAccountAddress = process.env.DOLFIN_ACCOUNT_ADDRESS as Address;
  const code = await publicClient.getCode({ address: user });

  if (!code || code === "0x") {
    // Externally owned account, cannot delegate
    return false;
  }

  // Not EIP-7702 delegation code
  if (!code.startsWith("0xef0100")) {
    return false;
  }

  const delegatedAddress = getAddress(`0x${code.slice(8)}`);

  return delegatedAddress.toLowerCase() === dolFinAccountAddress.toLowerCase();
}

export async function getUserEligibility(user: Address): Promise<{
  whitelisted: boolean;
  delegated: boolean;
}> {
  const whitelisted = await isAgentWhitelisted(user);
  const delegated = await hasDelegatedToDolfinAccount(user);

  return { whitelisted, delegated };
}

export async function getUserUSDCBalance(user: Address): Promise<{ balance: bigint }> {
  const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;

  const balance = await publicClient.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [user],
  });

  return { balance };
}

export async function getUserWETHBalance(user: Address): Promise<{ balance: bigint }> {
  const WETH = AaveV3ArbitrumSepolia.ASSETS.WETH.UNDERLYING as Address;

  const balance = await publicClient.readContract({
    address: WETH,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [user],
  });

  return { balance };
}

export async function executeFlashLoanUSDC(params: {
  user: Address;
  amount: bigint;
  swapAmount: bigint;
  supplyAmount: bigint;
  borrowAmount: bigint;
}): Promise<{ txHash: `0x${string}` }> {
  const { user, amount, swapAmount, supplyAmount, borrowAmount } = params;
  const POOL = AaveV3ArbitrumSepolia.POOL as Address;
  const WETH_GATEWAY = AaveV3ArbitrumSepolia.WETH_GATEWAY as Address;
  const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;
  const WETH = AaveV3ArbitrumSepolia.ASSETS.WETH.UNDERLYING as Address;

  const flashLoanFee = (amount * 5n) / 10000n;

  const txHash = await agentWallet.writeContract({
    abi: dolFinABI,
    functionName: "execute",
    address: user,
    args: [
      [
        {
          to: POOL,
          value: 0n,
          data: encodeFunctionData({
            abi: flashLoanSimpleAbi,
            functionName: "flashLoanSimple",
            args: [user, USDC, amount, "0x", 0],
          }),
        },
        {
          to: USDC,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [UNISWAP_SWAP_ROUTER_02 as Address, swapAmount],
          }),
        },
        {
          to: UNISWAP_SWAP_ROUTER_02 as Address,
          value: 0n,
          data: encodeFunctionData({
            abi: swapRouterAbi,
            functionName: "exactInputSingle",
            args: [
              {
                tokenIn: USDC,
                tokenOut: WETH,
                fee: 500,
                recipient: user,
                amountIn: swapAmount,
                amountOutMinimum: 0n,
                sqrtPriceLimitX96: 0n,
              },
            ],
          }),
        },
        {
          to: WETH,
          value: 0n,
          data: encodeFunctionData({
            abi: wethAbi,
            functionName: "withdraw",
            args: [supplyAmount],
          }),
        },
        {
          to: WETH_GATEWAY,
          value: supplyAmount,
          data: encodeFunctionData({
            abi: wethGatewayAbi,
            functionName: "depositETH",
            args: [user, 0],
          }),
        },
        {
          to: POOL,
          value: 0n,
          data: encodeFunctionData({
            abi: borrowAbi,
            functionName: "borrow",
            args: [USDC, borrowAmount, 2n, 0, user],
          }),
        },
        {
          to: USDC,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [POOL, amount + flashLoanFee],
          }),
        },
        {
          to: POOL,
          value: 0n,
          data: encodeFunctionData({
            abi: repayAbi,
            functionName: "repay",
            args: [USDC, amount + flashLoanFee, 2n, user],
          }),
        },
      ],
    ],
  });

  return { txHash };
}

export async function getLendingProtocolTvl(): Promise<{
  protocol: string;
  source: string;
  market: { name: string; address: string; chain: { chainId: number; name: string } };
  totalMarketSize: unknown;
  totalAvailableLiquidity: unknown;
}> {
  const marketData = await getArbitrumMarketData();

  return {
    protocol: "aave",
    source: "aave_market_data",
    market: {
      name: marketData.name,
      address: marketData.address,
      chain: marketData.chain,
    },
    totalMarketSize: marketData.totalMarketSize,
    totalAvailableLiquidity: marketData.totalAvailableLiquidity,
  };
}

export async function getCurrentAaveFlashLoanRate(): Promise<{
  flashLoanPremiumBps: number;
  flashLoanPremiumPercent: number;
  formula: string;
}> {
  const premiumTotal = await publicClient.readContract({
    address: AaveV3ArbitrumSepolia.POOL as Address,
    abi: AAVE_FLASH_LOAN_PREMIUM_ABI,
    functionName: "FLASHLOAN_PREMIUM_TOTAL",
  });

  return {
    flashLoanPremiumBps: Number(premiumTotal),
    flashLoanPremiumPercent: Number(premiumTotal) / 100,
    formula: "fee = amount * bps / 10000",
  };
}

export async function getAverageGasPrice(blockCount: number): Promise<{
  chain: string | undefined;
  sampleSize: number;
  averageGasPriceWei: bigint;
  averageGasPriceGwei: number;
  currentGasPriceWei: bigint;
  currentGasPriceGwei: number;
}> {
  const feeHistory = await publicClient.getFeeHistory({
    blockCount,
    rewardPercentiles: [50],
  });

  const totalWei = feeHistory.baseFeePerGas.reduce((sum, baseFee, i) => {
    const reward = feeHistory.reward?.[i]?.[0] ?? 0n;
    return sum + baseFee + reward;
  }, 0n);

  const avgWei = totalWei / BigInt(feeHistory.baseFeePerGas.length || 1);
  const currentWei = await publicClient.getGasPrice();

  return {
    chain: publicClient.chain?.name,
    sampleSize: feeHistory.baseFeePerGas.length,
    averageGasPriceWei: avgWei,
    averageGasPriceGwei: Number(avgWei) / 1e9,
    currentGasPriceWei: currentWei,
    currentGasPriceGwei: Number(currentWei) / 1e9,
  };
}

export async function getUserWalletBalance(user: Address): Promise<{
  asset: "ETH";
  chain: string | undefined;
  user: Address;
  balance: bigint;
}> {
  const balance = await publicClient.getBalance({ address: user });

  return {
    asset: "ETH",
    chain: publicClient.chain?.name,
    user,
    balance,
  };
}
