import type { Address } from "viem"
import type { MarketsInfoData, MarketsData } from "@gmx-io/sdk/types/markets"
import type { TokensData } from "@gmx-io/sdk/types/tokens"
import type { PositionsData, PositionsInfoData } from "@gmx-io/sdk/types/positions"
import type { OrdersInfoData } from "@gmx-io/sdk/types/orders"
import type { TradeAction } from "@gmx-io/sdk/types/tradeHistory"
import type {
  PrepareOrderResponse,
  SubmitOrderResponse,
  SubaccountApprovalPrepareResponse,
  SubaccountStatusResponse,
} from "@gmx-io/sdk/v2"

// Re-export SDK types for consumers
export type {
  MarketsInfoData,
  MarketsData,
  TokensData,
  PositionsData,
  PositionsInfoData,
  OrdersInfoData,
  TradeAction,
  PrepareOrderResponse,
  SubmitOrderResponse,
  SubaccountApprovalPrepareResponse,
  SubaccountStatusResponse,
}

// --- Request params (v1 - user signs tx themselves) ---

export type TradeHistoryParams = {
  userAddress: Address
  pageSize?: number
  pageIndex?: number
}

export type IncreasePositionParams = {
  payAmount: bigint
  marketAddress: Address
  payTokenAddress: Address
  collateralTokenAddress: Address
  leverage: bigint
  allowedSlippageBps: number
}

export type SwapParams = {
  fromAmount: bigint
  fromTokenAddress: Address
  toTokenAddress: Address
  allowedSlippageBps?: number
}

// --- Express order params (v2 - agent executes on behalf of user) ---

type ExpressOrderBase = {
  userAddress: Address
  subaccountApproval: Record<string, any>
  slippageBps: number
}

export type ExpressIncreaseParams = ExpressOrderBase & {
  direction: "long" | "short"
  symbol: string
  size: bigint
  payAmount: bigint
  payTokenAddress: Address
  collateralTokenAddress: Address
}

export type ExpressSwapParams = ExpressOrderBase & {
  fromAmount: bigint
  fromTokenAddress: Address
  toTokenAddress: Address
}

// --- Response types ---

export type MarketsInfoResponse = {
  marketsInfoData?: MarketsInfoData
  tokensData?: TokensData
  pricesUpdatedAt?: number
}

export type MarketsResponse = {
  marketsData?: MarketsData
  marketsAddresses?: string[]
  error?: Error
}

export type DailyVolumesResponse = Record<string, bigint> | undefined

export type PositionsResponse = {
  positionsData?: PositionsData
  allPossiblePositionsKeys?: string[]
  error?: Error
}

export type OrdersResponse = {
  count: number
  ordersInfoData: OrdersInfoData | Record<string, never>
}

export type TradeHistoryResponse = TradeAction[]