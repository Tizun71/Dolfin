import { tool } from "ai";
import { z } from "zod";
import { AaveV3ArbitrumSepolia } from "@aave-dao/aave-address-book";
import {
  createWalletClient,
  encodeFunctionData,
  http,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

const dolFinABI = [
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

const flashLoanSimpleAbi = [
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

const erc20Abi = [
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
] as const;

const swapRouterAbi = [
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

const supplyAbi = [
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

const borrowAbi = [
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

const repayAbi = [
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

const UNISWAP_SWAP_ROUTER_02 = "0x101F443B4d1b059569D643917553c771E1b9663E";

const agentWallet = createWalletClient({
  account: privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as Address),
  chain: arbitrumSepolia,
  transport: http(),
});

export const flashLoanUSDC = tool({
  description: "Initiates a flash loan in USDC on Aave V3 Arbitrum",
  inputSchema: z.object({
    user: z
      .string()
      .describe("The address of the user initiating the flash loan"),
    amount: z.bigint().positive().describe("The amount of USDC to borrow"),
    swapAmount: z
      .bigint()
      .positive()
      .describe("The amount of USDC to swap on Uniswap to get ETH"),
    supplyAmount: z
      .bigint()
      .positive()
      .describe("The amount of WETH to supply to the pool"),
    borrowAmount: z
      .bigint()
      .positive()
      .describe("The amount of USDC to borrow from the pool"),
  }),
  execute: async ({ user, amount, swapAmount, supplyAmount, borrowAmount }) => {
    const userAddr = user as Address;
    const POOL = AaveV3ArbitrumSepolia.POOL as Address;
    const USDC = AaveV3ArbitrumSepolia.ASSETS.USDC.UNDERLYING as Address;
    const WETH = AaveV3ArbitrumSepolia.ASSETS.WETH.UNDERLYING as Address;

    const flashLoanFee = (amount * 5n) / 10000n;

    const txHash = await agentWallet.writeContract({
      abi: dolFinABI,
      functionName: "execute",
      address: userAddr,
      args: [
        [
          {
            to: POOL,
            value: 0n,
            data: encodeFunctionData({
              abi: flashLoanSimpleAbi,
              functionName: "flashLoanSimple",
              args: [userAddr, USDC, amount, "0x", 0],
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
                  recipient: userAddr,
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
              abi: erc20Abi,
              functionName: "approve",
              args: [POOL, supplyAmount],
            }),
          },
          {
            to: POOL,
            value: 0n,
            data: encodeFunctionData({
              abi: supplyAbi,
              functionName: "supply",
              args: [WETH, supplyAmount, userAddr, 0],
            }),
          },
          {
            to: POOL,
            value: 0n,
            data: encodeFunctionData({
              abi: borrowAbi,
              functionName: "borrow",
              args: [USDC, borrowAmount, 2n, 0, userAddr],
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
        ],
      ],
    });

    return { txHash };
  },
});
