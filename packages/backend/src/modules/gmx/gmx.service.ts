import { GmxSdk } from "@gmx-io/sdk";
import { GmxApiSdk, PrivateKeySigner } from "@gmx-io/sdk/v2";
import { type Address } from "viem";
import { ChainId } from "../../configs/chain.js";

import type {
  DailyVolumesResponse,
  ExpressIncreaseParams,
  ExpressSwapParams,
  IncreasePositionParams,
  MarketsInfoResponse,
  MarketsResponse,
  OrdersResponse,
  PositionsInfoData,
  PositionsResponse,
  SubaccountApprovalPrepareResponse,
  SubaccountStatusResponse,
  SubmitOrderResponse,
  SwapParams,
  TradeHistoryParams,
  TradeHistoryResponse,
} from "./types.js";

import { GMX } from "./constants.js";
import { calculateExpiredTime } from "../../utils/timeCalculate.js";
import { getAgentGMXClient, getPublicClient } from "../../utils/viemClient.js";

const CHAIN_ID = ChainId.ARBITRUM;
const RPC_URL = GMX.RPC_URL;
const ORACLE_URL = GMX.ORACLE_URL;
const SUBSQUID_URL = GMX.SUBSQUID_URL;

const SUBACCOUNT_EXPIRY_SECONDS = GMX.SUBACCOUNT_EXPIRY_SECONDS;
const SUBACCOUNT_MAX_ACTIONS = GMX.SUBACCOUNT_MAX_ACTIONS;

class GMXService {
  private sdk: GmxSdk;
  private apiSdk: GmxApiSdk;
  private agentSigner: PrivateKeySigner;

  constructor() {
    const publicClient = getPublicClient(CHAIN_ID);

    this.sdk = new GmxSdk({
      chainId: CHAIN_ID,
      oracleUrl: ORACLE_URL,
      rpcUrl: RPC_URL,
      subsquidUrl: SUBSQUID_URL,
      publicClient,
    });

    this.apiSdk = new GmxApiSdk({ chainId: CHAIN_ID });

    this.agentSigner = getAgentGMXClient(CHAIN_ID)
  }

  get agentAddress(): string {
    return this.agentSigner.address;
  }

  // --- Read methods ---

  async getMarketsInfo(): Promise<MarketsInfoResponse> {
    return this.sdk.markets.getMarketsInfo();
  }

  async getMarkets(offset?: bigint, limit?: bigint): Promise<MarketsResponse> {
    return this.sdk.markets.getMarkets(offset, limit);
  }

  async getDailyVolumes(): Promise<DailyVolumesResponse> {
    return this.sdk.markets.getDailyVolumes();
  }

  async getPositions(userAddress: Address): Promise<PositionsResponse> {
    this.sdk.setAccount(userAddress);

    const [{ marketsData }, { tokensData }] = await Promise.all([
      this.sdk.markets.getMarkets(),
      this.sdk.markets.getMarketsInfo(),
    ]);

    if (!marketsData || !tokensData) {
      return { positionsData: undefined, allPossiblePositionsKeys: undefined };
    }

    return this.sdk.positions.getPositions({ marketsData, tokensData });
  }

  async getPositionsInfo(
    userAddress: Address,
  ): Promise<PositionsInfoData | Record<string, never>> {
    this.sdk.setAccount(userAddress);

    const { marketsInfoData, tokensData } =
      await this.sdk.markets.getMarketsInfo();

    if (!marketsInfoData || !tokensData) {
      return {};
    }

    return this.sdk.positions.getPositionsInfo({
      marketsInfoData,
      tokensData,
      showPnlInLeverage: false,
    });
  }

  async getOrders(userAddress: Address): Promise<OrdersResponse> {
    this.sdk.setAccount(userAddress);

    const { marketsInfoData, tokensData } =
      await this.sdk.markets.getMarketsInfo();

    if (!marketsInfoData || !tokensData) {
      return { count: 0, ordersInfoData: {} };
    }

    return this.sdk.orders.getOrders({
      account: userAddress,
      marketsInfoData,
      tokensData,
    });
  }

  async getTradeHistory({
    userAddress,
    pageSize = 20,
    pageIndex = 0,
  }: TradeHistoryParams): Promise<TradeHistoryResponse> {
    this.sdk.setAccount(userAddress);

    const { marketsInfoData, tokensData } =
      await this.sdk.markets.getMarketsInfo();

    return this.sdk.trades.getTradeHistory({
      pageSize,
      pageIndex,
      marketsInfoData,
      tokensData,
    });
  }

  // --- Subaccount methods ---

  async prepareSubaccountApproval(
    userAddress: Address,
  ): Promise<SubaccountApprovalPrepareResponse> {
    const expiresAt = calculateExpiredTime(SUBACCOUNT_EXPIRY_SECONDS);

    return this.apiSdk.prepareSubaccountApproval({
      account: userAddress,
      subaccountAddress: this.agentAddress,
      shouldAdd: true,
      expiresAt,
      maxAllowedCount: SUBACCOUNT_MAX_ACTIONS,
    });
  }

  async getSubaccountStatus(
    userAddress: Address,
  ): Promise<SubaccountStatusResponse> {
    return this.apiSdk.fetchSubaccountStatus({
      account: userAddress,
      subaccountAddress: this.agentAddress,
    });
  }

  // --- Express order methods (agent executes on behalf of user) ---

  async expressLong(
    params: ExpressIncreaseParams,
  ): Promise<SubmitOrderResponse> {
    return this.apiSdk.executeExpressOrder(
      {
        kind: "increase",
        direction: "long",
        orderType: "market",
        mode: "express",
        from: params.userAddress,
        symbol: params.symbol,
        size: params.size,
        slippage: params.slippageBps,
        collateralToken: params.collateralTokenAddress,
        collateralToPay: {
          amount: params.payAmount,
          token: params.payTokenAddress,
        },
        subaccountAddress: this.agentAddress,
        subaccountApproval: params.subaccountApproval,
      },
      this.agentSigner,
    );
  }

  async expressShort(
    params: ExpressIncreaseParams,
  ): Promise<SubmitOrderResponse> {
    return this.apiSdk.executeExpressOrder(
      {
        kind: "increase",
        direction: "short",
        orderType: "market",
        mode: "express",
        from: params.userAddress,
        symbol: params.symbol,
        size: params.size,
        slippage: params.slippageBps ?? 50,
        collateralToken: params.collateralTokenAddress,
        collateralToPay: {
          amount: params.payAmount,
          token: params.payTokenAddress,
        },
        subaccountAddress: this.agentAddress,
        subaccountApproval: params.subaccountApproval,
      },
      this.agentSigner,
    );
  }

  async expressSwap(params: ExpressSwapParams): Promise<SubmitOrderResponse> {
    return this.apiSdk.executeExpressOrder(
      {
        kind: "swap",
        orderType: "market",
        mode: "express",
        from: params.userAddress,
        collateralToPay: {
          amount: params.fromAmount,
          token: params.fromTokenAddress,
        },
        receiveToken: params.toTokenAddress,
        slippage: params.slippageBps ?? 50,
        subaccountAddress: this.agentAddress,
        subaccountApproval: params.subaccountApproval,
      },
      this.agentSigner,
    );
  }

  async expressClosePosition(params: {
    userAddress: Address;
    positionKey: string;
    subaccountApproval: Record<string, any>;
    slippageBps?: number;
  }): Promise<SubmitOrderResponse> {
    return this.apiSdk.executeExpressOrder(
      {
        kind: "decrease",
        orderType: "market",
        mode: "express",
        from: params.userAddress,
        subaccountAddress: this.agentAddress,
        subaccountApproval: params.subaccountApproval,
        slippage: params.slippageBps ?? 50,
      },
      this.agentSigner,
    );
  }

  async fetchOrderStatus(requestId: string) {
    return this.apiSdk.fetchOrderStatus({ requestId });
  }

  // --- v1 write methods (user signs themselves via walletClient) ---

  async openLongPosition(params: IncreasePositionParams) {
    return this.sdk.orders.long({
      payAmount: params.payAmount,
      marketAddress: params.marketAddress,
      payTokenAddress: params.payTokenAddress,
      collateralTokenAddress: params.collateralTokenAddress,
      leverage: params.leverage,
      allowedSlippageBps: params.allowedSlippageBps,
    });
  }

  async openShortPosition(params: IncreasePositionParams) {
    return this.sdk.orders.short({
      payAmount: params.payAmount,
      marketAddress: params.marketAddress,
      payTokenAddress: params.payTokenAddress,
      collateralTokenAddress: params.collateralTokenAddress,
      leverage: params.leverage,
      allowedSlippageBps: params.allowedSlippageBps,
    });
  }

  async swap(params: SwapParams) {
    return this.sdk.orders.swap({
      fromAmount: params.fromAmount,
      fromTokenAddress: params.fromTokenAddress,
      toTokenAddress: params.toTokenAddress,
      allowedSlippageBps: params.allowedSlippageBps,
    });
  }

  async cancelOrders(orderKeys: string[]) {
    return this.sdk.orders.cancelOrders(orderKeys);
  }
}

const gmxService = new GMXService();

export { gmxService };
