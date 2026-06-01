// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IPolicyManager.sol";

/**
 * @title PolicyManager
 * @notice The Dolfin policy engine. Holds the spending/risk policy each user grants to each
 *         AI session key and enforces it on every action (swap / lend / borrow / perp).
 *
 * Trust model:
 *  - Policy is keyed by (account, sessionKey). Only the `account` itself can write its own
 *    policy. The AI agent and relayer have no privileged role here.
 *  - A GUARDIAN_ROLE can globally pause the engine (kill-switch) and maintain the reference
 *    price feed, but can NOT move funds or edit user policies.
 */
contract PolicyManager is AccessControl, IPolicyManager {
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    bool public globalPaused;

    // Trusted USD price registry: token => USD price per whole token, scaled 1e18.
    // MVP: maintained by GUARDIAN_ROLE as a reference oracle. Production: swap for Chainlink.
    mapping(address => uint256) public priceUsd1e18;

    // account => sessionKey => Policy
    mapping(address => mapping(address => Policy)) private _policies;
    // account => sessionKey => token => allowed
    mapping(address => mapping(address => mapping(address => bool))) private _allowedToken;
    // account => sessionKey => protocol => action bitmask (bit i = ActionType i allowed)
    mapping(address => mapping(address => mapping(address => uint256))) private _actionMask;

    // rolling daily accounting, keyed by (account,sessionKey)
    mapping(address => mapping(address => uint256)) private _dayId;
    mapping(address => mapping(address => uint256)) private _dayVolume;
    mapping(address => mapping(address => uint256)) private _dayLoss;
    mapping(address => mapping(address => uint256)) private _exposure;
    mapping(address => mapping(address => bool)) private _broken;

    constructor(address admin, address guardian) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GUARDIAN_ROLE, guardian);
    }

    // ---------------------------------------------------------------------
    // User (account) configuration — msg.sender is the smart account itself
    // ---------------------------------------------------------------------

    function setPolicy(address sessionKey, Policy calldata p) external {
        Policy storage s = _policies[msg.sender][sessionKey];
        s.expiry = p.expiry;
        s.maxTradePerTx = p.maxTradePerTx;
        s.maxDailyVolume = p.maxDailyVolume;
        s.maxExposure = p.maxExposure;
        s.maxLossPerDay = p.maxLossPerDay;
        s.maxDrawdownBps = p.maxDrawdownBps;
        s.maxLeverageBps = p.maxLeverageBps;
        s.exists = true;
        s.paused = p.paused;
        _broken[msg.sender][sessionKey] = false; // fresh / rotated grant clears the breaker
        emit PolicySet(msg.sender, sessionKey, s);
    }

    function setAllowedTokens(address sessionKey, address[] calldata tokens, bool allowed) external {
        for (uint256 i = 0; i < tokens.length; i++) {
            _allowedToken[msg.sender][sessionKey][tokens[i]] = allowed;
            emit TokenAllowed(msg.sender, sessionKey, tokens[i], allowed);
        }
    }

    /// @notice Whitelist which action types a session key may perform on a protocol.
    /// @param mask bitmask: bit (1 << uint(ActionType)) set = that action allowed. 0 = protocol disabled.
    function setAllowedActions(address sessionKey, address protocol, uint256 mask) external {
        _actionMask[msg.sender][sessionKey][protocol] = mask;
        emit ActionsAllowed(msg.sender, sessionKey, protocol, mask);
    }

    function setSessionPaused(address sessionKey, bool paused) external {
        _policies[msg.sender][sessionKey].paused = paused;
        emit SessionPaused(msg.sender, sessionKey, paused);
    }

    // ---------------------------------------------------------------------
    // Enforcement — called by the account during execution
    // ---------------------------------------------------------------------

    /// @inheritdoc IPolicyManager
    function checkAndRecord(TradeContext calldata ctx) external {
        address account = msg.sender; // the smart account self-calls
        address sk = ctx.sessionKey;
        Policy memory p = _policies[account][sk];

        if (globalPaused) revert GloballyPaused();
        if (!p.exists) revert PolicyMissing();
        if (p.paused) revert SessionPausedErr();
        if (_broken[account][sk]) revert CircuitBroken();
        if (block.timestamp > p.expiry) revert SessionExpired();

        // action-type / protocol whitelist
        uint256 mask = _actionMask[account][sk][ctx.protocol];
        if (mask & (1 << uint256(ctx.actionType)) == 0) revert ActionNotAllowed(ctx.protocol, ctx.actionType);

        // token whitelist (skip zero-address sentinels)
        if (ctx.tokenIn != address(0) && !_allowedToken[account][sk][ctx.tokenIn]) revert TokenNotAllowed(ctx.tokenIn);
        if (ctx.tokenOut != address(0) && !_allowedToken[account][sk][ctx.tokenOut]) {
            revert TokenNotAllowed(ctx.tokenOut);
        }

        // USD notional. Leverage only applies when *opening* a perp.
        uint256 value = valueUsd(ctx.tokenIn, ctx.amountIn, ctx.tokenInDecimals);
        if (ctx.actionType == ActionType.OPEN_PERP) {
            if (ctx.leverageBps == 0 || ctx.leverageBps > p.maxLeverageBps) {
                revert LeverageTooHigh(ctx.leverageBps, p.maxLeverageBps);
            }
            value = (value * ctx.leverageBps) / 10_000;
        }
        if (value > p.maxTradePerTx) revert TradeTooLarge(value, p.maxTradePerTx);

        // rolling-day reset
        uint256 today = block.timestamp / 1 days;
        if (_dayId[account][sk] != today) {
            _dayId[account][sk] = today;
            _dayVolume[account][sk] = 0;
            _dayLoss[account][sk] = 0;
        }

        uint256 newVol = _dayVolume[account][sk] + value;
        if (newVol > p.maxDailyVolume) revert DailyVolumeExceeded(newVol, p.maxDailyVolume);
        _dayVolume[account][sk] = newVol;

        // only risk-opening actions add to exposure; closes/withdraws/repays don't
        if (_opensRisk(ctx.actionType)) {
            uint256 newExp = _exposure[account][sk] + value;
            if (newExp > p.maxExposure) revert ExposureExceeded(newExp, p.maxExposure);
            _exposure[account][sk] = newExp;
        }

        emit TradeRecorded(account, sk, ctx.actionType, value, newVol);
    }

    /// @inheritdoc IPolicyManager
    function recordPnl(address sessionKey, int256 pnlUsd) external {
        address account = msg.sender;
        Policy memory p = _policies[account][sessionKey];
        if (!p.exists) revert PolicyMissing();

        uint256 today = block.timestamp / 1 days;
        if (_dayId[account][sessionKey] != today) {
            _dayId[account][sessionKey] = today;
            _dayVolume[account][sessionKey] = 0;
            _dayLoss[account][sessionKey] = 0;
        }

        if (pnlUsd < 0) {
            uint256 loss = uint256(-pnlUsd);
            uint256 exp = _exposure[account][sessionKey];
            _exposure[account][sessionKey] = loss >= exp ? 0 : exp - loss;

            uint256 dayLoss = _dayLoss[account][sessionKey] + loss;
            _dayLoss[account][sessionKey] = dayLoss;
            emit LossRecorded(account, sessionKey, pnlUsd, dayLoss);

            if (p.maxLossPerDay != 0 && dayLoss > p.maxLossPerDay) {
                _broken[account][sessionKey] = true;
                emit CircuitBreakerTripped(account, sessionKey, "maxLossPerDay");
                return;
            }
            if (p.maxDrawdownBps != 0 && p.maxExposure != 0) {
                uint256 ddBps = (dayLoss * 10_000) / p.maxExposure;
                if (ddBps >= p.maxDrawdownBps) {
                    _broken[account][sessionKey] = true;
                    emit CircuitBreakerTripped(account, sessionKey, "maxDrawdownBps");
                }
            }
        } else {
            uint256 gain = uint256(pnlUsd);
            uint256 exp = _exposure[account][sessionKey];
            _exposure[account][sessionKey] = gain >= exp ? 0 : exp - gain;
            emit LossRecorded(account, sessionKey, pnlUsd, _dayLoss[account][sessionKey]);
        }
    }

    // ---------------------------------------------------------------------
    // Guardian kill-switch + price feed (cannot touch funds or policies)
    // ---------------------------------------------------------------------

    function setGlobalPause(bool paused) external onlyRole(GUARDIAN_ROLE) {
        globalPaused = paused;
        emit EmergencyPause(paused);
    }

    /// @notice Reference price feed. price = USD per 1.0 whole token, scaled 1e18.
    function setPrice(address token, uint256 price) external onlyRole(GUARDIAN_ROLE) {
        priceUsd1e18[token] = price;
        emit PriceSet(token, price);
    }

    // ---------------------------------------------------------------------
    // Views / helpers
    // ---------------------------------------------------------------------

    /// @inheritdoc IPolicyManager
    function valueUsd(address token, uint256 amount, uint8 decimals) public view returns (uint256) {
        if (token == address(0) || amount == 0) return 0;
        uint256 price = priceUsd1e18[token];
        if (price == 0) revert PriceUnset(token);
        return (amount * price) / (10 ** decimals);
    }

    function _opensRisk(ActionType a) private pure returns (bool) {
        return a == ActionType.SWAP || a == ActionType.SUPPLY || a == ActionType.BORROW || a == ActionType.OPEN_PERP;
    }

    function getPolicy(address account, address sessionKey) external view returns (Policy memory) {
        return _policies[account][sessionKey];
    }

    function isTokenAllowed(address account, address sessionKey, address token) external view returns (bool) {
        return _allowedToken[account][sessionKey][token];
    }

    function allowedActionMask(address account, address sessionKey, address protocol) external view returns (uint256) {
        return _actionMask[account][sessionKey][protocol];
    }

    function dayVolume(address account, address sessionKey) external view returns (uint256) {
        if (_dayId[account][sessionKey] != block.timestamp / 1 days) return 0;
        return _dayVolume[account][sessionKey];
    }

    function exposure(address account, address sessionKey) external view returns (uint256) {
        return _exposure[account][sessionKey];
    }

    function isBroken(address account, address sessionKey) external view returns (bool) {
        return _broken[account][sessionKey];
    }
}
