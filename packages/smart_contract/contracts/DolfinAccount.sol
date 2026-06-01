// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DolfinAccount {
    error CallFailed(uint256 index, bytes returnData);
    error UnauthorizedCaller();
    error AlreadyWhitelisted();
    error NotWhitelisted();

    event CallExecuted(
        uint256 indexed index,
        address indexed to,
        uint256 value,
        bytes data
    );
    event CallerWhitelisted(address indexed caller);
    event CallerRemovedFromWhitelist(address indexed caller);

    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    struct AccountStorage {
        mapping(address => bool) whitelistedCallers;
        bool executing;
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

    function initialize() external {}

    // Chỉ owner (address(this)) gọi trực tiếp từ bên ngoài, không phải từ trong _executeCalls
    function executeDirect(Call[] calldata calls) external payable {
        if (msg.sender != address(this)) revert UnauthorizedCaller();
        AccountStorage storage $ = _getAccountStorage();
        if ($.executing) revert UnauthorizedCaller();
        _executeCalls(calls);
    }

    // Owner hoặc whitelisted caller
    function execute(Call[] calldata calls) external payable {
        AccountStorage storage $ = _getAccountStorage();
        if (msg.sender != address(this) && !$.whitelistedCallers[msg.sender]) {
            revert UnauthorizedCaller();
        }
        _executeCalls(calls);
    }

    // Chỉ owner gọi trực tiếp, không được gọi từ trong _executeCalls
    function addToWhitelist(address caller) external {
        if (msg.sender != address(this)) revert UnauthorizedCaller();
        AccountStorage storage $ = _getAccountStorage();
        if ($.executing) revert UnauthorizedCaller();
        if ($.whitelistedCallers[caller]) revert AlreadyWhitelisted();
        $.whitelistedCallers[caller] = true;
        emit CallerWhitelisted(caller);
    }

    // Chỉ owner gọi trực tiếp, không được gọi từ trong _executeCalls
    function removeFromWhitelist(address caller) external {
        if (msg.sender != address(this)) revert UnauthorizedCaller();
        AccountStorage storage $ = _getAccountStorage();
        if ($.executing) revert UnauthorizedCaller();
        if (!$.whitelistedCallers[caller]) revert NotWhitelisted();
        $.whitelistedCallers[caller] = false;
        emit CallerRemovedFromWhitelist(caller);
    }

    function isWhitelisted(address caller) external view returns (bool) {
        return _getAccountStorage().whitelistedCallers[caller];
    }

    function _executeCalls(Call[] calldata calls) internal {
        AccountStorage storage $ = _getAccountStorage();
        $.executing = true;
        for (uint256 i = 0; i < calls.length; i++) {
            (bool ok, bytes memory ret) = calls[i].to.call{
                value: calls[i].value
            }(calls[i].data);
            if (!ok) revert CallFailed(i, ret);
            emit CallExecuted(i, calls[i].to, calls[i].value, calls[i].data);
        }
        $.executing = false;
    }

    fallback() external payable {}

    receive() external payable {}
}
