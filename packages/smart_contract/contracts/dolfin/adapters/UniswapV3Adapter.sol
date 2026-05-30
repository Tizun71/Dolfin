// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../interfaces/ITradeAdapter.sol";
import "../interfaces/IProtocols.sol";

/**
 * @title UniswapV3Adapter
 * @notice Plans an exact-input single swap on a Uniswap V3 router. Stateless / fund-less.
 *         actionData = abi.encode(router, tokenIn, tokenOut, fee, amountIn, amountOutMinimum, deadline)
 */
contract UniswapV3Adapter is ITradeAdapter {
    error SlippageUnset();
    error DeadlinePassed();

    function plan(address account, bytes calldata actionData)
        external
        view
        returns (IPolicyManager.TradeContext memory ctx, Approval[] memory approvals, Call[] memory calls)
    {
        (
            address router,
            address tokenIn,
            address tokenOut,
            uint24 fee,
            uint256 amountIn,
            uint256 amountOutMinimum,
            uint256 deadline
        ) = abi.decode(actionData, (address, address, address, uint24, uint256, uint256, uint256));

        if (amountOutMinimum == 0) revert SlippageUnset();
        if (deadline < block.timestamp) revert DeadlinePassed();

        ctx = IPolicyManager.TradeContext({
            sessionKey: address(0), // pinned by the account
            protocol: router,
            actionType: IPolicyManager.ActionType.SWAP,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            tokenInDecimals: IERC20Metadata(tokenIn).decimals(),
            leverageBps: 0
        });

        approvals = new Approval[](1);
        approvals[0] = Approval({token: tokenIn, spender: router, amount: amountIn});

        calls = new Call[](1);
        calls[0] = Call({
            target: router,
            value: 0,
            data: abi.encodeCall(
                ISwapRouter.exactInputSingle,
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: tokenIn,
                    tokenOut: tokenOut,
                    fee: fee,
                    recipient: account,
                    deadline: deadline,
                    amountIn: amountIn,
                    amountOutMinimum: amountOutMinimum,
                    sqrtPriceLimitX96: 0
                })
            )
        });
    }
}
