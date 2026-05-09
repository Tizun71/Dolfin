// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DolfinAccount is EIP712 {
    using ECDSA for bytes32;

    error InvalidSignature();
    error CallFailed(uint256 index, bytes returnData);
    error UnauthorizedCaller();

    event CallExecuted(
        uint256 indexed index,
        address indexed to,
        uint256 value,
        bytes data
    );

    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    struct AccountStorage {
        mapping(address => uint256) nonces;
    }

    bytes32 private constant _ACCOUNT_STORAGE_SLOT =
        keccak256(abi.encode(uint256(keccak256("DolfinAccount")) - 1)) &
            ~bytes32(uint256(0xff));

    function _getAccountStorage()
        private
        pure
        returns (AccountStorage storage $)
    {
        bytes32 slot = _ACCOUNT_STORAGE_SLOT;
        assembly {
            $.slot := slot
        }
    }

    bytes32 public constant CALL_TYPEHASH =
        keccak256("Call(address to,uint256 value,bytes data)");

    bytes32 public constant EXECUTE_TYPEHASH =
        keccak256(
            "Execute(Call[] calls,uint256 nonce)"
            "Call(address to,uint256 value,bytes data)"
        );

    constructor() EIP712("DolfinAccount", "1") {}

    function execute(
        Call[] calldata calls,
        bytes calldata signature
    ) external payable {
        if (msg.sender != address(this)) {
            uint256 nonce = _useNonce(address(this));
            bytes32 digest = _buildDigest(calls, nonce);
            address recovered = digest.recover(signature);

            if (recovered != address(this)) revert InvalidSignature();
        }

        _executeCalls(calls);
    }

    function executeDirect(Call[] calldata calls) external payable {
        if (msg.sender != address(this)) revert UnauthorizedCaller();
        _executeCalls(calls);
    }

    function getNonce(address account) external view returns (uint256) {
        return _getAccountStorage().nonces[account];
    }

    function getDigest(
        Call[] calldata calls,
        uint256 nonce
    ) external view returns (bytes32) {
        return _buildDigest(calls, nonce);
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function _useNonce(address account) internal returns (uint256 current) {
        AccountStorage storage $ = _getAccountStorage();
        current = $.nonces[account];
        $.nonces[account] = current + 1;
    }

    function _hashCall(Call calldata c) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(CALL_TYPEHASH, c.to, c.value, keccak256(c.data))
            );
    }

    function _buildDigest(
        Call[] calldata calls,
        uint256 nonce
    ) internal view returns (bytes32) {
        bytes32[] memory callHashes = new bytes32[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            callHashes[i] = _hashCall(calls[i]);
        }
        bytes32 callsHash = keccak256(abi.encodePacked(callHashes));

        bytes32 structHash = keccak256(
            abi.encode(EXECUTE_TYPEHASH, callsHash, nonce)
        );

        return _hashTypedDataV4(structHash);
    }

    function _executeCalls(Call[] calldata calls) internal {
        for (uint256 i = 0; i < calls.length; i++) {
            (bool ok, bytes memory ret) = calls[i].to.call{
                value: calls[i].value
            }(calls[i].data);
            if (!ok) revert CallFailed(i, ret);
            emit CallExecuted(i, calls[i].to, calls[i].value, calls[i].data);
        }
    }

    // Allows the delegated EOA to receive native tokens.
    fallback() external payable {}

    receive() external payable {}
}
