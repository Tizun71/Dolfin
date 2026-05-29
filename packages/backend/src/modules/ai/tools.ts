import { tool } from "ai";
import { z } from "zod";
import {
  executeFlashLoanUSDC,
  getAverageGasPrice,
  getCurrentAaveFlashLoanRate,
  getLendingProtocolTvl,
  getUserEligibility,
  getUserUSDCBalance,
  getUserWalletBalance,
  getUserWETHBalance,
} from "./services.js";

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
    return getUserEligibility(user as `0x${string}`);
  },
});

export const userUSDCBalance = tool({
  description: "Checks the USDC balance of a user on Aave V3 Arbitrum",
  inputSchema: z.object({
    user: z.string().describe("The address of the user to check the balance of"),
  }),
  execute: async ({ user }) => {
    return getUserUSDCBalance(user as `0x${string}`);
  },
});

export const userWETHBalance = tool({
  description: "Checks the WETH balance of a user on Aave V3 Arbitrum",
  inputSchema: z.object({
    user: z.string().describe("The address of the user to check the balance of"),
  }),
  execute: async ({ user }) => {
    return getUserWETHBalance(user as `0x${string}`);
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
    return executeFlashLoanUSDC({
      user: user as `0x${string}`,
      amount,
      swapAmount,
      supplyAmount,
      borrowAmount,
    });
  },
});

export const lendingProtocolTVL = tool({
  description: "Get TVL (USD) for Aave lending market.",
  inputSchema: z.object({}),
  execute: async () => {
    return getLendingProtocolTvl();
  },
});

export const currentAaveFlashLoanRate = tool({
  description: "Get current flash loan premium rate from Aave Pool on Arbitrum Sepolia.",
  inputSchema: z.object({}),
  execute: async () => {
    return getCurrentAaveFlashLoanRate();
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
    return getAverageGasPrice(blockCount);
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
    return getUserWalletBalance(user as `0x${string}`);
  },
});
