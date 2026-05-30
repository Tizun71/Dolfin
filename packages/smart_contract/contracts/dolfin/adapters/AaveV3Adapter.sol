// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../interfaces/ITradeAdapter.sol";
import "../interfaces/IProtocols.sol";

/**
 * @title AaveV3Adapter
 * @notice Plans Aave V3 lending actions. Stateless / fund-less.
 *         actionData = abi.encode(uint8 action, address pool, address asset, uint256 amount, uint256 rateMode)
 *         action: 0=SUPPLY, 1=WITHDRAW, 2=BORROW, 3=REPAY
 */
contract AaveV3Adapter is ITradeAdapter {
    error BadAction();

    function plan(address account, bytes calldata actionData)
        external
        view
        returns (IPolicyManager.TradeContext memory ctx, Approval[] memory approvals, Call[] memory calls)
    {
        (uint8 action, address pool, address asset, uint256 amount, uint256 rateMode) =
            abi.decode(actionData, (uint8, address, address, uint256, uint256));

        IPolicyManager.ActionType at;
        calls = new Call[](1);

        if (action == 0) {
            at = IPolicyManager.ActionType.SUPPLY;
            approvals = new Approval[](1);
            approvals[0] = Approval({token: asset, spender: pool, amount: amount});
            calls[0] = Call({target: pool, value: 0, data: abi.encodeCall(IAavePool.supply, (asset, amount, account, 0))});
        } else if (action == 1) {
            at = IPolicyManager.ActionType.WITHDRAW;
            approvals = new Approval[](0);
            calls[0] = Call({target: pool, value: 0, data: abi.encodeCall(IAavePool.withdraw, (asset, amount, account))});
        } else if (action == 2) {
            at = IPolicyManager.ActionType.BORROW;
            approvals = new Approval[](0);
            calls[0] = Call({
                target: pool,
                value: 0,
                data: abi.encodeCall(IAavePool.borrow, (asset, amount, rateMode, 0, account))
            });
        } else if (action == 3) {
            at = IPolicyManager.ActionType.REPAY;
            approvals = new Approval[](1);
            approvals[0] = Approval({token: asset, spender: pool, amount: amount});
            calls[0] =
                Call({target: pool, value: 0, data: abi.encodeCall(IAavePool.repay, (asset, amount, rateMode, account))});
        } else {
            revert BadAction();
        }

        ctx = IPolicyManager.TradeContext({
            sessionKey: address(0),
            protocol: pool,
            actionType: at,
            tokenIn: asset,
            tokenOut: address(0),
            amountIn: amount,
            tokenInDecimals: IERC20Metadata(asset).decimals(),
            leverageBps: 0
        });
    }
}
