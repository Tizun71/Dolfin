// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../interfaces/ITradeAdapter.sol";
import "../interfaces/IProtocols.sol";

/**
 * @title GmxAdapter
 * @notice Plans GMX-style perp open/close. Stateless / fund-less.
 *         The policy engine derives notional = collateralUsd * leverage and enforces maxLeverage.
 *
 *         OPEN:  actionData = abi.encode(uint8(0), router, collateralToken, indexToken, collateralAmount, leverageBps, isLong)
 *         CLOSE: actionData = abi.encode(uint8(1), router, collateralToken, indexToken, sizeUsd,         leverageBps, isLong)
 */
contract GmxAdapter is ITradeAdapter {
    error BadAction();

    function plan(address account, bytes calldata actionData)
        external
        view
        returns (IPolicyManager.TradeContext memory ctx, Approval[] memory approvals, Call[] memory calls)
    {
        (
            uint8 action,
            address router,
            address collateralToken,
            address indexToken,
            uint256 amount, // OPEN: collateral amount; CLOSE: sizeUsd to close
            uint16 leverageBps,
            bool isLong
        ) = abi.decode(actionData, (uint8, address, address, address, uint256, uint16, bool));

        calls = new Call[](1);

        if (action == 0) {
            // OPEN_PERP: pull collateral, open a position of notional = collateral * leverage
            uint256 sizeUsd = (amount * leverageBps) / 10_000; // expressed in collateral units for the mock
            approvals = new Approval[](1);
            approvals[0] = Approval({token: collateralToken, spender: router, amount: amount});
            calls[0] = Call({
                target: router,
                value: 0,
                data: abi.encodeCall(
                    IGmxPositionRouter.createIncreasePosition,
                    (collateralToken, indexToken, amount, sizeUsd, isLong, account)
                )
            });
            ctx = IPolicyManager.TradeContext({
                sessionKey: address(0),
                protocol: router,
                actionType: IPolicyManager.ActionType.OPEN_PERP,
                tokenIn: collateralToken,
                tokenOut: indexToken,
                amountIn: amount,
                tokenInDecimals: IERC20Metadata(collateralToken).decimals(),
                leverageBps: leverageBps
            });
        } else if (action == 1) {
            // CLOSE_PERP: no collateral pulled; valuation uses collateralToken decimals on `amount` (sizeUsd proxy)
            approvals = new Approval[](0);
            calls[0] = Call({
                target: router,
                value: 0,
                data: abi.encodeCall(
                    IGmxPositionRouter.createDecreasePosition, (collateralToken, indexToken, amount, isLong, account)
                )
            });
            ctx = IPolicyManager.TradeContext({
                sessionKey: address(0),
                protocol: router,
                actionType: IPolicyManager.ActionType.CLOSE_PERP,
                tokenIn: collateralToken,
                tokenOut: indexToken,
                amountIn: amount,
                tokenInDecimals: IERC20Metadata(collateralToken).decimals(),
                leverageBps: 0
            });
        } else {
            revert BadAction();
        }
    }
}
