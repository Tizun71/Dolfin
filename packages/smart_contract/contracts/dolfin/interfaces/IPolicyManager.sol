// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IPolicyManager
 * @notice On-chain policy engine for Dolfin AI trading session keys.
 *         Every AI-initiated action (swap, lend, borrow, perp...) is validated against
 *         the user's policy before execution. The policy is owned by the user (the smart
 *         account); the AI agent / relayer can never modify it.
 */
interface IPolicyManager {
    /// @notice Class of on-chain action. The bit index (1 << ActionType) forms the per-protocol mask.
    enum ActionType {
        SWAP, // 0  spot swap (Uniswap...)
        SUPPLY, // 1  lend / deposit collateral (Aave...)
        WITHDRAW, // 2  withdraw supplied funds
        BORROW, // 3  borrow against collateral (adds debt and exposure)
        REPAY, // 4  repay debt
        OPEN_PERP, // 5  open leveraged position (GMX...)
        CLOSE_PERP // 6  close leveraged position
    }

    /// @notice Action intent forwarded by a DolfinSmartAccount for validation.
    /// @dev USD notional is computed inside the PolicyManager from a trusted price registry,
    ///      never supplied by the AI/relayer, so limits cannot be bypassed.
    struct TradeContext {
        address sessionKey; // session key that authorized this action (set by the account, not the adapter)
        address protocol; // protocol the action targets (must be whitelisted for this action type)
        ActionType actionType;
        address tokenIn; // collateral / input token used for USD valuation (0 = skip)
        address tokenOut; // output / borrowed / position token (0 = skip whitelist check)
        uint256 amountIn; // raw tokenIn amount (token's own decimals)
        uint8 tokenInDecimals; // decimals of tokenIn
        uint16 leverageBps; // perps only: 10000 = 1x. 0 for non-perp actions.
    }

    /// @notice Full policy a user grants to a single session key.
    struct Policy {
        uint48 expiry; // unix ts after which the key is dead
        uint128 maxTradePerTx; // max USD notional per single action
        uint128 maxDailyVolume; // max USD notional per rolling day
        uint128 maxExposure; // max cumulative open USD exposure
        uint128 maxLossPerDay; // daily realized-loss circuit breaker (USD)
        uint16 maxDrawdownBps; // drawdown threshold in bps; breach disables key
        uint16 maxLeverageBps; // max leverage for perps (10000 = 1x)
        bool exists;
        bool paused;
    }

    event PolicySet(address indexed account, address indexed sessionKey, Policy policy);
    event TokenAllowed(address indexed account, address indexed sessionKey, address token, bool allowed);
    event ActionsAllowed(address indexed account, address indexed sessionKey, address protocol, uint256 mask);
    event SessionPaused(address indexed account, address indexed sessionKey, bool paused);
    event TradeRecorded(
        address indexed account, address indexed sessionKey, ActionType actionType, uint256 valueUsd, uint256 dayVolume
    );
    event LossRecorded(address indexed account, address indexed sessionKey, int256 pnlUsd, uint256 dayLoss);
    event CircuitBreakerTripped(address indexed account, address indexed sessionKey, string reason);
    event EmergencyPause(bool paused);
    event PriceSet(address indexed token, uint256 priceUsd1e18);

    error PolicyMissing();
    error SessionExpired();
    error SessionPausedErr();
    error TokenNotAllowed(address token);
    error ActionNotAllowed(address protocol, ActionType actionType);
    error LeverageTooHigh(uint256 leverageBps, uint256 max);
    error TradeTooLarge(uint256 value, uint256 max);
    error DailyVolumeExceeded(uint256 value, uint256 max);
    error ExposureExceeded(uint256 value, uint256 max);
    error CircuitBroken();
    error GloballyPaused();
    error PriceUnset(address token);

    /// @notice Validate an action against policy AND record volume/exposure. Reverts on any violation.
    /// @dev MUST be called by the account itself (msg.sender == account) during the execution phase.
    function checkAndRecord(TradeContext calldata ctx) external;

    /// @notice Record realized PnL after a position settles; trips the circuit breaker on breach.
    function recordPnl(address sessionKey, int256 pnlUsd) external;

    /// @notice USD value (1e18) the engine assigns to a raw token amount, per the price registry.
    function valueUsd(address token, uint256 amount, uint8 decimals) external view returns (uint256);

    function getPolicy(address account, address sessionKey) external view returns (Policy memory);
    function isTokenAllowed(address account, address sessionKey, address token) external view returns (bool);
    function allowedActionMask(address account, address sessionKey, address protocol) external view returns (uint256);
}
