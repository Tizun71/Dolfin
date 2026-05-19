import { tool } from "ai";
import { z } from "zod";
import { AaveV3ArbitrumSepolia } from "@aave-dao/aave-address-book";
import { encodeFunctionData, type Address } from "viem";
import { getArbitrumMarketData } from "../aave/services.js";
import {
  agentWallet,
  borrowAbi,
  erc20Abi,
  flashLoanSimpleAbi,
  dolFinABI,
  hasDelegatedToDolfinAccount,
  isUserWhitelisted,
  publicClient,
  repayAbi,
  swapRouterAbi,
  UNISWAP_SWAP_ROUTER_02,
  wethAbi,
  wethGatewayAbi,
} from "./services.js";

const AAVE_FLASH_LOAN_PREMIUM_ABI = [
  {
    type: "function",
    name: "FLASHLOAN_PREMIUM_TOTAL",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint128" }],
  },
] as const;

export const checkUserEligibility = tool({
  description:
    "Checks if a user is eligible to use the Dolfin Account (either by being whitelisted or having delegated their account)",
  inputSchema: z.object({
    user: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/)
      .describe("The address of the user to check eligibility for"),
  }),
  execute: async ({ user }) => {
    const userAddr = user as Address;
    const whitelisted = await isUserWhitelisted(userAddr);
    const delegated = await hasDelegatedToDolfinAccount(userAddr);

    return { whitelisted, delegated };
  },
});

export const userUSDCBalance = tool({
  description: "Checks the USDC balance of a user on Aave V3 Arbitrum",
  inputSchema: z.object({
    user: z.string().describe("The address of the user to check the balance of"),
  }),
  execute: async ({ user }) => {
    const userAddr = user as Address;
    const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;

    const balance = await publicClient.readContract({
      address: USDC,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddr],
    });

    return { balance };
  },
});

export const userWETHBalance = tool({
  description: "Checks the WETH balance of a user on Aave V3 Arbitrum",
  inputSchema: z.object({
    user: z.string().describe("The address of the user to check the balance of"),
  }),
  execute: async ({ user }) => {
    const userAddr = user as Address;
    const WETH = AaveV3ArbitrumSepolia.ASSETS.WETH.UNDERLYING as Address;

    const balance = await publicClient.readContract({
      address: WETH,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddr],
    });

    return { balance };
  },
});

export const flashLoanUSDC = tool({
  description: "Initiates a flash loan in USDC on Aave V3 Arbitrum using the WETH gateway",
  inputSchema: z.object({
    user: z.string().describe("The address of the user initiating the flash loan"),
    amount: z.bigint().positive().describe("The amount of USDC to borrow"),
    swapAmount: z.bigint().positive().describe("The amount of USDC to swap on Uniswap to get WETH"),
    supplyAmount: z
      .bigint()
      .positive()
      .describe("The amount of WETH/ETH to supply to Aave via the WETH gateway"),
    borrowAmount: z.bigint().positive().describe("The amount of USDC to borrow from the pool"),
  }),
  execute: async ({ user, amount, swapAmount, supplyAmount, borrowAmount }) => {
    const userAddr = user as Address;
    const POOL = AaveV3ArbitrumSepolia.POOL as Address;
    const WETH_GATEWAY = AaveV3ArbitrumSepolia.WETH_GATEWAY as Address;
    const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;
    const WETH = AaveV3ArbitrumSepolia.ASSETS.WETH.UNDERLYING as Address;

    const flashLoanFee = (amount * 5n) / 10000n;

    const txHash = await agentWallet.writeContract({
      abi: dolFinABI,
      functionName: "execute",
      address: userAddr,
      args: [
        [
          // 1) take a flash loan from the Pool
          {
            to: POOL,
            value: 0n,
            data: encodeFunctionData({
              abi: flashLoanSimpleAbi,
              functionName: "flashLoanSimple",
              args: [userAddr, USDC, amount, "0x", 0],
            }),
          },
          // 2) approve USDC for swap
          {
            to: USDC,
            value: 0n,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [UNISWAP_SWAP_ROUTER_02 as Address, swapAmount],
            }),
          },
          // 3) swap USDC -> WETH on Uniswap
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
                  recipient: userAddr,
                  amountIn: swapAmount,
                  amountOutMinimum: 0n,
                  sqrtPriceLimitX96: 0n,
                },
              ],
            }),
          },
          // 4) unwrap WETH -> ETH
          {
            to: WETH,
            value: 0n,
            data: encodeFunctionData({
              abi: wethAbi,
              functionName: "withdraw",
              args: [supplyAmount],
            }),
          },
          // 5) deposit ETH to Aave via WETH gateway (payable)
          {
            to: WETH_GATEWAY,
            value: supplyAmount,
            data: encodeFunctionData({
              abi: wethGatewayAbi,
              functionName: "depositETH",
              args: [userAddr, 0],
            }),
          },
          // 6) borrow USDC from the Pool
          {
            to: POOL,
            value: 0n,
            data: encodeFunctionData({
              abi: borrowAbi,
              functionName: "borrow",
              args: [USDC, borrowAmount, 2n, 0, userAddr],
            }),
          },
          // 7) approve USDC to repay the flash loan
          {
            to: USDC,
            value: 0n,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [POOL, amount + flashLoanFee],
            }),
          },
          // 8) repay the flash loan
          {
            to: POOL,
            value: 0n,
            data: encodeFunctionData({
              abi: repayAbi,
              functionName: "repay",
              args: [USDC, amount + flashLoanFee, 2n, userAddr],
            }),
          },
        ],
      ],
    });

    return { txHash };
  },
});

export const lendingProtocolTVL = tool({
  description: "Get TVL (USD) for Aave lending market.",
  inputSchema: z.object({}),
  execute: async () => {
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
  },
});

export const currentAaveFlashLoanRate = tool({
  description: "Get current flash loan premium rate from Aave Pool on Arbitrum Sepolia.",
  inputSchema: z.object({}),
  execute: async () => {
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
  },
});

export const averageGasPrice = tool({
  description:
    "Get average gas price from recent blocks and current gas price on Arbitrum Sepolia.",
  inputSchema: z.object({
    blockCount: z
      .number()
      .int()
      .min(2)
      .max(100)
      .default(20)
      .describe("Number of recent blocks to average"),
  }),
  execute: async ({ blockCount }) => {
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
  },
});

export const userWalletBalance = tool({
  description: "Get user native ETH wallet balance on Arbitrum Sepolia.",
  inputSchema: z.object({
    user: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/)
      .describe("Wallet address to inspect"),
  }),
  execute: async ({ user }) => {
    const userAddr = user as Address;
    const balance = await publicClient.getBalance({ address: userAddr });

    return {
      asset: "ETH",
      chain: publicClient.chain?.name,
      user: userAddr,
      balance,
    };
  },
});
