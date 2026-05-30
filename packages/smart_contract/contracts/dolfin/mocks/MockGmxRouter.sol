// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IProtocols.sol";

/**
 * @title MockGmxRouter
 * @notice Minimal perp router test double: escrows collateral on open, tracks position size.
 */
contract MockGmxRouter is IGmxPositionRouter {
    using SafeERC20 for IERC20;

    struct Position {
        uint256 collateral;
        uint256 sizeUsd;
        bool isLong;
    }

    mapping(address => Position) public positions; // account => position

    function createIncreasePosition(
        address collateralToken,
        address, /*indexToken*/
        uint256 collateralAmount,
        uint256 sizeUsd,
        bool isLong,
        address account
    ) external {
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);
        Position storage p = positions[account];
        p.collateral += collateralAmount;
        p.sizeUsd += sizeUsd;
        p.isLong = isLong;
    }

    function createDecreasePosition(
        address, /*collateralToken*/
        address, /*indexToken*/
        uint256 sizeUsd,
        bool, /*isLong*/
        address receiver
    ) external {
        Position storage p = positions[receiver];
        p.sizeUsd = sizeUsd >= p.sizeUsd ? 0 : p.sizeUsd - sizeUsd;
    }
}
