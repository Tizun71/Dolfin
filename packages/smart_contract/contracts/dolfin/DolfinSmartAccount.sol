// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/accounts/SimpleAccount.sol";
import "@account-abstraction/contracts/utils/Exec.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/IPolicyManager.sol";
import "./interfaces/ITradeAdapter.sol";

/**
 * @title DolfinSmartAccount
 * @notice ERC-4337 (v0.8) smart account owned by a user, that can delegate constrained
 *         trading authority to AI "session keys" across many protocols via adapters.
 *
 * Security model
 * --------------
 *  - The user (owner) has full control: arbitrary `execute`/`executeBatch`.
 *  - A session key (the AI agent's signer) can ONLY call `executeAction`, routed through an
 *    owner-whitelisted adapter, and every call is checked & recorded by the PolicyManager
 *    (token + (protocol,action) whitelist, per-tx + daily caps, exposure, leverage, expiry,
 *    pause, circuit breaker).
 *  - The session key is recovered in the validation phase and pinned in transient storage;
 *    `executeAction` reads it to know which policy to enforce and clears it after.
 *  - Adapters are stateless planners and never receive funds or delegatecall. The account
 *    itself grants the EXACT token approvals an adapter requests and resets them to 0 right
 *    after — never an unbounded approval.
 *
 * NOTE (bundling): session-key UserOperations MUST be submitted one-per-bundle (our relayer
 * guarantees this). EntryPoint runs all validations before all executions; with multiple
 * session ops in one bundle the transient signer would be overwritten. Owner ops are unaffected.
 */
contract DolfinSmartAccount is SimpleAccount, EIP712, ReentrancyGuardTransient {
    using SafeERC20 for IERC20;

    struct SessionKey {
        uint48 validUntil; // mirrored in policy; used for the AA time-range
        bool revoked;
        bool exists;
    }

    bytes32 private constant _SESSION_GRANT_TYPEHASH =
        keccak256("SessionGrant(address sessionKey,uint48 validUntil,uint256 nonce)");

    IPolicyManager public policyManager;
    bool public accountPaused; // owner-level kill switch for all session activity
    mapping(address => SessionKey) public sessionKeys;
    mapping(uint256 => bool) public usedGrantNonce;
    mapping(address => bool) public trustedAdapters; // owner-whitelisted protocol planners

    // transient: session key recovered during validateUserOp, consumed by executeAction
    address private transient _sessionSigner;

    event PolicyManagerSet(address indexed policyManager);
    event AdapterSet(address indexed adapter, bool trusted);
    event SessionKeyRegistered(address indexed sessionKey, uint48 validUntil);
    event SessionKeyRevoked(address indexed sessionKey);
    event SessionKeyRotated(address indexed oldKey, address indexed newKey, uint48 validUntil);
    event AccountPauseSet(bool paused);
    event ActionExecuted(address indexed sessionKey, address indexed adapter, IPolicyManager.ActionType actionType);

    error SessionOnlyAction();
    error AdapterNotTrusted();
    error AccountIsPaused();
    error GrantNonceUsed();
    error BadGrantSignature();
    error NothingToExecute();

    /// @dev `name`/`version` for EIP-712 are bytecode constants → proxy-safe (OZ recomputes the domain per chain/address).
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) EIP712("DolfinSmartAccount", "1") {}

    /// @notice Proxy initializer: set owner and the policy engine.
    function initialize(address anOwner, address _policyManager) public virtual initializer {
        _initialize(anOwner);
        policyManager = IPolicyManager(_policyManager);
        emit PolicyManagerSet(_policyManager);
    }

    // ------------------------------------------------------------------
    // Signature validation (AA)
    // ------------------------------------------------------------------

    /// @dev signature = [1-byte mode][65-byte ECDSA over EIP-191(userOpHash)]. mode 0 = owner, 1 = session key.
    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        override
        returns (uint256 validationData)
    {
        bytes calldata sig = userOp.signature;
        if (sig.length != 66) return SIG_VALIDATION_FAILED;

        uint8 mode = uint8(sig[0]);
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
        (address signer, ECDSA.RecoverError err,) = ECDSA.tryRecover(ethHash, sig[1:]);
        if (err != ECDSA.RecoverError.NoError) return SIG_VALIDATION_FAILED;

        if (mode == 0) {
            return signer == owner ? SIG_VALIDATION_SUCCESS : SIG_VALIDATION_FAILED;
        }

        SessionKey memory sk = sessionKeys[signer];
        if (!sk.exists || sk.revoked || accountPaused) return SIG_VALIDATION_FAILED;
        _sessionSigner = signer;
        return _packValidationData(false, sk.validUntil, 0); // EntryPoint enforces auto-expiry
    }

    // ------------------------------------------------------------------
    // Execution
    // ------------------------------------------------------------------

    /// @dev Arbitrary calls are owner-only. A session-validated op must use executeAction.
    function execute(address target, uint256 value, bytes calldata data) external override {
        _requireForExecute();
        if (_sessionSigner != address(0)) revert SessionOnlyAction();
        bool ok = Exec.call(target, value, data, gasleft());
        if (!ok) Exec.revertWithReturnData();
    }

    function executeBatch(Call[] calldata calls) external override {
        _requireForExecute();
        if (_sessionSigner != address(0)) revert SessionOnlyAction();
        uint256 n = calls.length;
        for (uint256 i = 0; i < n; i++) {
            bool ok = Exec.call(calls[i].target, calls[i].value, calls[i].data, gasleft());
            if (!ok) {
                if (n == 1) Exec.revertWithReturnData();
                else revert ExecuteError(i, Exec.getReturnData(0));
            }
        }
    }

    /// @notice The single entry point AI session keys may use, routed through a trusted adapter.
    ///         Owner may also call it directly (policy bypassed for the owner).
    function executeAction(address adapter, bytes calldata actionData) external nonReentrant {
        _requireForExecute();
        if (!trustedAdapters[adapter]) revert AdapterNotTrusted();

        (
            IPolicyManager.TradeContext memory ctx,
            ITradeAdapter.Approval[] memory approvals,
            ITradeAdapter.Call[] memory calls
        ) = ITradeAdapter(adapter).plan(address(this), actionData);
        if (calls.length == 0) revert NothingToExecute();

        address sk = _sessionSigner;
        if (sk != address(0)) {
            if (accountPaused) revert AccountIsPaused();
            ctx.sessionKey = sk; // account pins the validated signer; adapter cannot spoof it
            policyManager.checkAndRecord(ctx);
            _sessionSigner = address(0); // consume
        }

        // grant exact approvals (never max)
        for (uint256 i = 0; i < approvals.length; i++) {
            IERC20(approvals[i].token).forceApprove(approvals[i].spender, approvals[i].amount);
        }
        // execute the protocol calls
        for (uint256 i = 0; i < calls.length; i++) {
            bool ok = Exec.call(calls[i].target, calls[i].value, calls[i].data, gasleft());
            if (!ok) Exec.revertWithReturnData();
        }
        // leave no standing allowance
        for (uint256 i = 0; i < approvals.length; i++) {
            IERC20(approvals[i].token).forceApprove(approvals[i].spender, 0);
        }

        emit ActionExecuted(sk, adapter, ctx.actionType);
    }

    /// @notice Report realized PnL of a settled position to the policy engine.
    function reportPnl(address sessionKey, int256 pnlUsd) external onlyOwner {
        policyManager.recordPnl(sessionKey, pnlUsd);
    }

    // ------------------------------------------------------------------
    // Adapter + session-key lifecycle (owner only)
    // ------------------------------------------------------------------

    function setPolicyManager(address _policyManager) external onlyOwner {
        policyManager = IPolicyManager(_policyManager);
        emit PolicyManagerSet(_policyManager);
    }

    function setAdapter(address adapter, bool trusted) public onlyOwner {
        trustedAdapters[adapter] = trusted;
        emit AdapterSet(adapter, trusted);
    }

    function registerSessionKey(address key, uint48 validUntil) public onlyOwner {
        sessionKeys[key] = SessionKey({validUntil: validUntil, revoked: false, exists: true});
        emit SessionKeyRegistered(key, validUntil);
    }

    /// @notice Register a session key from a single off-chain owner signature ("sign once").
    function registerSessionKeyWithSig(address key, uint48 validUntil, uint256 nonce, bytes calldata ownerSig)
        external
    {
        if (usedGrantNonce[nonce]) revert GrantNonceUsed();
        bytes32 structHash = keccak256(abi.encode(_SESSION_GRANT_TYPEHASH, key, validUntil, nonce));
        address signer = ECDSA.recover(_hashTypedDataV4(structHash), ownerSig);
        if (signer != owner) revert BadGrantSignature();
        usedGrantNonce[nonce] = true;
        sessionKeys[key] = SessionKey({validUntil: validUntil, revoked: false, exists: true});
        emit SessionKeyRegistered(key, validUntil);
    }

    function revokeSessionKey(address key) external onlyOwner {
        sessionKeys[key].revoked = true;
        emit SessionKeyRevoked(key);
    }

    function rotateSessionKey(address oldKey, address newKey, uint48 validUntil) external onlyOwner {
        sessionKeys[oldKey].revoked = true;
        sessionKeys[newKey] = SessionKey({validUntil: validUntil, revoked: false, exists: true});
        emit SessionKeyRotated(oldKey, newKey, validUntil);
    }

    // ------------------------------------------------------------------
    // Risk controls
    // ------------------------------------------------------------------

    function pauseAgent() external onlyOwner {
        accountPaused = true;
        emit AccountPauseSet(true);
    }

    function resumeAgent() external onlyOwner {
        accountPaused = false;
        emit AccountPauseSet(false);
    }

    /// @notice Per-protocol action permission for a session key (forwarded to PolicyManager as this account).
    struct ProtocolGrant {
        address protocol;
        uint256 actionMask; // bit (1 << ActionType) set = allowed
    }

    /// @notice Convenience grant: register key + adapters + push policy + token/action whitelist in one owner tx.
    function configureSession(
        address key,
        uint48 validUntil,
        IPolicyManager.Policy calldata policy,
        address[] calldata adapters,
        address[] calldata tokens,
        ProtocolGrant[] calldata protocolGrants
    ) external onlyOwner {
        registerSessionKey(key, validUntil);
        for (uint256 i = 0; i < adapters.length; i++) {
            setAdapter(adapters[i], true);
        }
        PolicyManagerLike pm = PolicyManagerLike(address(policyManager));
        pm.setPolicy(key, policy);
        pm.setAllowedTokens(key, tokens, true);
        for (uint256 i = 0; i < protocolGrants.length; i++) {
            pm.setAllowedActions(key, protocolGrants[i].protocol, protocolGrants[i].actionMask);
        }
    }
}

/// @dev Minimal view of the writable PolicyManager surface the account calls as itself.
interface PolicyManagerLike {
    function setPolicy(address sessionKey, IPolicyManager.Policy calldata p) external;
    function setAllowedTokens(address sessionKey, address[] calldata tokens, bool allowed) external;
    function setAllowedActions(address sessionKey, address protocol, uint256 mask) external;
}
