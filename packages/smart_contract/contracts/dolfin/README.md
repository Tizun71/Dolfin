# Dolfin — Autonomous AI Trading on ERC-4337

MVP of an autonomous AI trading agent that trades **while the user is offline**, but
**never** gets unrestricted access to funds. Authority is delegated through a scoped,
revocable **session key**; every action is enforced on-chain by a **PolicyManager**; and
protocols plug in through **adapters** (Uniswap, Aave, GMX...).

```
User (owner key)
  └─ signs once ──▶ Session Grant (EIP-712)
                      │
ERC-4337 Smart Account (DolfinSmartAccount)
  ├─ owner: full control (execute / executeBatch / lifecycle)
  └─ session key: executeAction(adapter, data) ONLY
            │ adapter ∈ trustedAdapters (owner-whitelisted)
            ▼
        Adapter.plan() ──▶ { TradeContext, approvals, calls }
            │
        PolicyManager.checkAndRecord(ctx)   ← enforce
            │ token + (protocol,action) whitelist
            │ per-tx / daily / exposure caps, leverage
            │ expiry / pause / circuit breaker
            ▼
        account grants EXACT approval ▶ protocol call ▶ reset approval to 0
                                                          (Uniswap / Aave / GMX)
AI Agent (no keys, no funds) ──signal──▶ Execution Relayer (holds session key) ──▶ Bundler
```

## Contracts

| Contract | Role |
|---|---|
| `DolfinSmartAccount.sol` | ERC-4337 v0.8 account. Owner + session keys. `executeAction(adapter, data)` is the only path a session key may use (arbitrary `execute` reverts for sessions). UUPS, EIP-712 grants, adapter registry, exact (never max) approvals, ReentrancyGuard. |
| `PolicyManager.sol` | Per-`(account, sessionKey)` policy + enforcement. Token whitelist, per-`(protocol, actionType)` bitmask, `maxTradePerTx`, rolling `maxDailyVolume`, `maxExposure`, `maxLeverage`, expiry, pause, daily-loss / drawdown circuit breaker. Trusted USD price registry (→ Chainlink in prod). |
| `adapters/UniswapV3Adapter.sol` | Plans `exactInputSingle` swaps (slippage + deadline). |
| `adapters/AaveV3Adapter.sol` | Plans supply / withdraw / borrow / repay. |
| `adapters/GmxAdapter.sol` | Plans perp open / close with leverage. |
| `DolfinAccountFactory.sol` | CREATE2 factory (ERC-1967 proxies, counterfactual addresses). |
| `interfaces/` | `IPolicyManager`, `ITradeAdapter`, `IProtocols` (Uniswap/Aave/GMX). |
| `mocks/` | `MockERC20`, `MockSwapRouter`, `MockAavePool`, `MockGmxRouter`. |

## Adapter model (how to add a protocol)

An adapter is a **stateless, fund-less planner**. It never holds funds and never receives
delegatecall. Given `plan(account, actionData)` it returns:

- a `TradeContext` for the PolicyManager (action type, tokens, USD-relevant amount, leverage),
- the **exact** token approvals the account must grant,
- the low-level calls to run against the protocol.

The account is the executor and the trust boundary: it pins the validated session key into
the context (adapters can't spoof it), enforces policy, grants exact approvals, runs the
calls, then resets approvals to 0.

**To add e.g. Curve / Morpho:** write an adapter implementing `ITradeAdapter`, add a mock,
add the relevant `ActionType` if new, the user whitelists `(protocol, action)` + the adapter.
No change to the account or policy engine.

## Action types & risk

`ActionType { SWAP, SUPPLY, WITHDRAW, BORROW, REPAY, OPEN_PERP, CLOSE_PERP }`.

- USD notional is computed **on-chain** from the price registry — the AI cannot under-report value.
- `OPEN_PERP` notional = `collateralUsd × leverageBps`; `maxLeverageBps` is enforced.
- Risk-opening actions (`SWAP`, `SUPPLY`, `BORROW`, `OPEN_PERP`) add to `exposure`; closes/withdraws/repays don't.
- `reportPnl` feeds the daily-loss / drawdown circuit breaker.

## Trade lifecycle

1. **Grant** — `configureSession(key, expiry, policy, adapters, tokens, protocolGrants)` (one
   owner tx): registers the key, whitelists adapters, and writes policy + token + per-protocol
   action masks to the PolicyManager *as the account*. (Or `registerSessionKeyWithSig` for a
   single off-chain EIP-712 grant.)
2. **Decide** — AI Agent (`offchain/agent.ts`) → `TradeDecision`. No keys, no funds.
3. **Encode + Relay** — `offchain/encoders.ts` builds `actionData`; `offchain/relayer.ts` builds
   a UserOp `callData = executeAction(adapter, actionData)`, signs with the **session key**
   (`0x01` mode byte + EIP-191 sig), submits to the bundler.
4. **Validate** — EntryPoint → `validateUserOp`: recovers signer, confirms live session key,
   returns `[validAfter, validUntil]` so the key **auto-expires**.
5. **Execute** — EntryPoint → `executeAction`: adapter plans → PolicyManager enforces → exact
   approve → protocol call → approve 0.

## Security requirement → mechanism

| Requirement | Mechanism |
|---|---|
| AI never has unrestricted fund access | Session key can only call `executeAction` via owner-trusted adapters; arbitrary `execute` reverts (`SessionOnlyAction`). |
| On-chain permissions & spend limits | `PolicyManager.checkAndRecord` every action: whitelist + per-tx/daily/exposure/leverage. |
| User can revoke any time | `revokeSessionKey`, `pauseAgent`, `setSessionPaused`, guardian `setGlobalPause`. |
| Expiry / rotation / multi-agent | `validUntil` in AA validation data; `rotateSessionKey`; per-key mappings. |
| Replay attacks | EntryPoint nonce + chain/EntryPoint-bound `userOpHash`; EIP-712 grant nonce. |
| Signature forgery | ECDSA recover vs registered owner/session key; bad sig ⇒ `SIG_VALIDATION_FAILED`. |
| Privilege escalation | Policy writes `msg.sender`-scoped to the account; guardian can pause but not move funds/edit policy; account pins session key (adapter can't spoof). |
| Malicious AI / adapter output | On-chain re-validation authoritative; USD value computed on-chain; adapters owner-whitelisted & fund-less (no delegatecall). |
| Unlimited / draining approvals | `forceApprove(spender, amount)` then `forceApprove(spender, 0)` — never `type(uint256).max`. |
| Reentrancy | `ReentrancyGuardTransient` on `executeAction`. |

## Known MVP limitations

- **One session-op per bundle** (validated signer pinned in transient storage; relayer ensures it). Owner ops unaffected.
- Price registry is guardian-set → replace with Chainlink in prod.
- `reportPnl` is owner-reported → derive from settlement events / oracle in prod.
- Adapters/mocks are simplified; real Aave/GMX integrations need their full param sets, health-factor/funding handling.

## Tests (41 passing)

`test/PolicyManager.test.ts` (policy units incl. action mask + leverage) and
`test/DolfinSmartAccount.test.ts` (full EntryPoint → account → adapter e2e across Uniswap,
Aave, GMX, plus policy rejection, untrusted adapter, revoke).

```bash
npx hardhat test
npx hardhat ignition deploy ignition/modules/DolfinStack.ts --network arbitrumSepolia
```
