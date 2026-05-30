// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "./DolfinSmartAccount.sol";

/**
 * @title DolfinAccountFactory
 * @notice CREATE2 factory for DolfinSmartAccount proxies (counterfactual addresses).
 */
contract DolfinAccountFactory {
    DolfinSmartAccount public immutable accountImplementation;
    address public immutable policyManager;

    event AccountCreated(address indexed account, address indexed owner, uint256 salt);

    constructor(IEntryPoint entryPoint, address _policyManager) {
        accountImplementation = new DolfinSmartAccount(entryPoint);
        policyManager = _policyManager;
    }

    function createAccount(address owner, uint256 salt) public returns (DolfinSmartAccount) {
        address addr = getAddress(owner, salt);
        if (addr.code.length > 0) {
            return DolfinSmartAccount(payable(addr));
        }
        ERC1967Proxy proxy = new ERC1967Proxy{salt: bytes32(salt)}(
            address(accountImplementation),
            abi.encodeCall(DolfinSmartAccount.initialize, (owner, policyManager))
        );
        emit AccountCreated(address(proxy), owner, salt);
        return DolfinSmartAccount(payable(address(proxy)));
    }

    /// @notice Counterfactual address of the account for (owner, salt).
    function getAddress(address owner, uint256 salt) public view returns (address) {
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(
                        address(accountImplementation),
                        abi.encodeCall(DolfinSmartAccount.initialize, (owner, policyManager))
                    )
                )
            )
        );
    }
}
