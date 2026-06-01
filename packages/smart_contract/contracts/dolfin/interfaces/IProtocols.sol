// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Minimal Uniswap V3 SwapRouter interface (exactInputSingle).
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

/// @title Minimal Aave V3 Pool interface.
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)
        external;
    function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf)
        external
        returns (uint256);
}

/// @title Minimal GMX-style perp router interface (simplified for the MVP).
interface IGmxPositionRouter {
    function createIncreasePosition(
        address collateralToken,
        address indexToken,
        uint256 collateralAmount,
        uint256 sizeUsd,
        bool isLong,
        address account
    ) external;

    function createDecreasePosition(
        address collateralToken,
        address indexToken,
        uint256 sizeUsd,
        bool isLong,
        address receiver
    ) external;
}
