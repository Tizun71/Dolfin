// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IProtocols.sol";

/**
 * @title MockSwapRouter
 * @notice Test double for the Uniswap V3 router. Pulls tokenIn, pays out tokenOut
 *         at a configurable rate. Must be pre-funded with tokenOut.
 */
contract MockSwapRouter is ISwapRouter {
    using SafeERC20 for IERC20;

    // rate scaled 1e18: amountOut = amountIn * rate / 1e18 (ignores decimals diff for test simplicity)
    uint256 public rate = 1e18;

    function setRate(uint256 r) external {
        rate = r;
    }

    function exactInputSingle(ExactInputSingleParams calldata p) external payable returns (uint256 amountOut) {
        require(p.deadline >= block.timestamp, "router: expired");
        IERC20(p.tokenIn).safeTransferFrom(msg.sender, address(this), p.amountIn);
        amountOut = (p.amountIn * rate) / 1e18;
        require(amountOut >= p.amountOutMinimum, "router: slippage");
        IERC20(p.tokenOut).safeTransfer(p.recipient, amountOut);
    }
}
