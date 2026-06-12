// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IPolicyManager.sol";

/**
 * @title ITradeAdapter
 * @notice A stateless, fund-less "planner" for one protocol (Uniswap, Aave, GMX...).
 *
 * The account calls `plan(account, actionData)`; the adapter decodes the intent and returns:
 *   - a TradeContext for the PolicyManager to enforce,
 *   - the token approvals the account must grant (exact amounts; reset to 0 afterwards),
 *   - the low-level calls the account must perform.
 *
 * The adapter never holds funds and never receives delegatecall; it only describes work.
 * The account remains the executor and the trust boundary (adapters are owner-whitelisted).
 */
interface ITradeAdapter {
    struct Approval {
        address token;
        address spender;
        uint256 amount;
    }

    struct Call {
        address target;
        uint256 value;
        bytes data;
    }

    /**
     * @param account the smart account that will execute (recipient of swaps/borrows).
     * @param actionData ABI-encoded, adapter-specific parameters.
     * @return ctx     policy context (the account overwrites `sessionKey` with the validated key).
     * @return approvals token approvals to grant before the calls.
     * @return calls    calls to execute against the protocol.
     */
    function plan(address account, bytes calldata actionData)
        external
        view
        returns (IPolicyManager.TradeContext memory ctx, Approval[] memory approvals, Call[] memory calls);
}
