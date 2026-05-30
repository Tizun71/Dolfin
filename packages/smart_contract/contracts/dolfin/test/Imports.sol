// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Pull the reference EntryPoint into compilation so tests can deploy it by name.
import "@account-abstraction/contracts/core/EntryPoint.sol";

/// @dev Local subclass so Hardhat emits an artifact we can deploy by name in tests.
contract TestEntryPoint is EntryPoint {}
