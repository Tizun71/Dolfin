// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IProtocols.sol";

/**
 * @title MockAavePool
 * @notice Minimal test double: tracks supplied/borrowed balances and moves tokens.
 *         Must be pre-funded with assets to satisfy withdraw/borrow.
 */
contract MockAavePool is IAavePool {
    using SafeERC20 for IERC20;

    mapping(address => mapping(address => uint256)) public supplied; // user => asset => amount
    mapping(address => mapping(address => uint256)) public debt; // user => asset => amount

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        supplied[onBehalfOf][asset] += amount;
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        supplied[msg.sender][asset] -= amount;
        IERC20(asset).safeTransfer(to, amount);
        return amount;
    }

    function borrow(address asset, uint256 amount, uint256, uint16, address onBehalfOf) external {
        debt[onBehalfOf][asset] += amount;
        IERC20(asset).safeTransfer(onBehalfOf, amount);
    }

    function repay(address asset, uint256 amount, uint256, address onBehalfOf) external returns (uint256) {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        debt[onBehalfOf][asset] -= amount;
        return amount;
    }
}
