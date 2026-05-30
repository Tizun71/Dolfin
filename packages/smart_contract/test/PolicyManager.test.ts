import { describe, it } from "node:test";
import hre from "hardhat";
import assert from "node:assert";

const { viem, networkHelpers } = await hre.network.create();

// USD limits scaled 1e18. Prices = USD per whole token, scaled 1e18.
const USD = (n: number) => BigInt(Math.round(n)) * 10n ** 18n;
const DAY = 24n * 60n * 60n;

// ActionType enum (mirror of IPolicyManager)
const A = { SWAP: 0, SUPPLY: 1, WITHDRAW: 2, BORROW: 3, REPAY: 4, OPEN_PERP: 5, CLOSE_PERP: 6 };
const bit = (a: number) => 1n << BigInt(a);

const USDC = "0x1111111111111111111111111111111111111111" as const;
const WETH = "0x2222222222222222222222222222222222222222" as const;
const WBTC = "0x3333333333333333333333333333333333333333" as const;
const ROUTER = "0x4444444444444444444444444444444444444444" as const;
const BAD_TOKEN = "0x5555555555555555555555555555555555555555" as const;
const BAD_ROUTER = "0x6666666666666666666666666666666666666666" as const;

function basePolicy(over: Partial<any> = {}) {
  return {
    expiry: 2_000_000_000n,
    maxTradePerTx: USD(100),
    maxDailyVolume: USD(1000),
    maxExposure: USD(5000),
    maxLossPerDay: USD(200),
    maxDrawdownBps: 5000,
    maxLeverageBps: 30000, // 3x
    exists: true,
    paused: false,
    ...over,
  };
}

async function expectRevert(p: Promise<unknown>, needle?: string) {
  try {
    await p;
    assert.fail("expected revert, but call succeeded");
  } catch (e: any) {
    if (needle) {
      const msg = (e?.shortMessage ?? "") + (e?.message ?? "") + JSON.stringify(e?.metaMessages ?? "");
      assert.ok(msg.includes(needle), `expected revert containing "${needle}", got: ${msg.slice(0, 300)}`);
    }
  }
}

describe("PolicyManager", () => {
  async function fixture() {
    const [acct, guardian, agent] = await viem.getWalletClients();
    const pm = await viem.deployContract("PolicyManager", [guardian.account.address, guardian.account.address]);
    await pm.write.setPrice([USDC, USD(1)], { account: guardian.account });
    await pm.write.setPrice([WETH, USD(3000)], { account: guardian.account });
    await pm.write.setPrice([WBTC, USD(60000)], { account: guardian.account });
    return { pm, acct, guardian, sessionKey: agent.account.address };
  }

  async function configure(pm: any, acct: any, sessionKey: string, policy = basePolicy(), mask = bit(A.SWAP)) {
    await pm.write.setPolicy([sessionKey, policy], { account: acct.account });
    await pm.write.setAllowedTokens([sessionKey, [USDC, WETH, WBTC], true], { account: acct.account });
    await pm.write.setAllowedActions([sessionKey, ROUTER, mask], { account: acct.account });
  }

  function ctx(sessionKey: string, over: Partial<any> = {}) {
    return {
      sessionKey,
      protocol: ROUTER,
      actionType: A.SWAP,
      tokenIn: USDC,
      tokenOut: WETH,
      amountIn: 50n * 10n ** 6n, // $50
      tokenInDecimals: 6,
      leverageBps: 0,
      ...over,
    };
  }

  it("computes USD value from the price registry", async () => {
    const { pm } = await fixture();
    assert.equal(await pm.read.valueUsd([USDC, 50n * 10n ** 6n, 6]), USD(50));
    assert.equal(await pm.read.valueUsd([WETH, 10n ** 18n, 18]), USD(3000));
  });

  it("accepts a compliant swap and records volume + exposure", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey);
    await pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account });
    assert.equal(await pm.read.dayVolume([acct.account.address, sessionKey]), USD(50));
    assert.equal(await pm.read.exposure([acct.account.address, sessionKey]), USD(50));
  });

  it("rejects a missing policy", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await expectRevert(pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account }), "PolicyMissing");
  });

  it("rejects a disallowed action type on a protocol", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey, basePolicy(), bit(A.SWAP)); // only SWAP allowed
    await expectRevert(
      pm.write.checkAndRecord([ctx(sessionKey, { actionType: A.BORROW })], { account: acct.account }),
      "ActionNotAllowed",
    );
  });

  it("rejects an unknown protocol", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey);
    await expectRevert(
      pm.write.checkAndRecord([ctx(sessionKey, { protocol: BAD_ROUTER })], { account: acct.account }),
      "ActionNotAllowed",
    );
  });

  it("rejects a non-whitelisted token", async () => {
    const { pm, acct, guardian, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey);
    await pm.write.setPrice([BAD_TOKEN, USD(1)], { account: guardian.account });
    await expectRevert(
      pm.write.checkAndRecord([ctx(sessionKey, { tokenOut: BAD_TOKEN })], { account: acct.account }),
      "TokenNotAllowed",
    );
  });

  it("rejects a trade above maxTradePerTx", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey);
    await expectRevert(
      pm.write.checkAndRecord([ctx(sessionKey, { amountIn: 200n * 10n ** 6n })], { account: acct.account }),
      "TradeTooLarge",
    );
  });

  it("enforces the rolling daily volume cap", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey, basePolicy({ maxDailyVolume: USD(120) }));
    const big = ctx(sessionKey, { amountIn: 80n * 10n ** 6n });
    await pm.write.checkAndRecord([big], { account: acct.account });
    await expectRevert(pm.write.checkAndRecord([big], { account: acct.account }), "DailyVolumeExceeded");
    await networkHelpers.time.increase(DAY + 1n);
    await pm.write.checkAndRecord([big], { account: acct.account });
    assert.equal(await pm.read.dayVolume([acct.account.address, sessionKey]), USD(80));
  });

  it("enforces max exposure", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey, basePolicy({ maxExposure: USD(70), maxDailyVolume: USD(1000) }));
    await pm.write.checkAndRecord([ctx(sessionKey, { amountIn: 50n * 10n ** 6n })], { account: acct.account });
    await expectRevert(
      pm.write.checkAndRecord([ctx(sessionKey, { amountIn: 50n * 10n ** 6n })], { account: acct.account }),
      "ExposureExceeded",
    );
  });

  it("applies leverage to perp notional and enforces maxLeverage", async () => {
    const { pm, acct, sessionKey } = await fixture();
    // allow OPEN_PERP, cap leverage 3x, per-tx $100. $40 collateral * 3x = $120 > $100 → reject
    await configure(pm, acct, sessionKey, basePolicy({ maxLeverageBps: 30000 }), bit(A.OPEN_PERP));
    await expectRevert(
      pm.write.checkAndRecord(
        [ctx(sessionKey, { actionType: A.OPEN_PERP, amountIn: 40n * 10n ** 6n, leverageBps: 30000 })],
        { account: acct.account },
      ),
      "TradeTooLarge",
    );
    // 5x exceeds the 3x cap regardless of size
    await expectRevert(
      pm.write.checkAndRecord(
        [ctx(sessionKey, { actionType: A.OPEN_PERP, amountIn: 10n * 10n ** 6n, leverageBps: 50000 })],
        { account: acct.account },
      ),
      "LeverageTooHigh",
    );
    // $20 collateral * 3x = $60 ≤ $100 → ok
    await pm.write.checkAndRecord(
      [ctx(sessionKey, { actionType: A.OPEN_PERP, amountIn: 20n * 10n ** 6n, leverageBps: 30000 })],
      { account: acct.account },
    );
    assert.equal(await pm.read.exposure([acct.account.address, sessionKey]), USD(60));
  });

  it("auto-expires the session", async () => {
    const { pm, acct, sessionKey } = await fixture();
    const now = BigInt((await (await viem.getPublicClient()).getBlock()).timestamp);
    await configure(pm, acct, sessionKey, basePolicy({ expiry: now + 100n }));
    await networkHelpers.time.increase(200n);
    await expectRevert(pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account }), "SessionExpired");
  });

  it("honours user pause and global pause", async () => {
    const { pm, acct, guardian, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey);
    await pm.write.setSessionPaused([sessionKey, true], { account: acct.account });
    await expectRevert(pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account }), "SessionPaused");
    await pm.write.setSessionPaused([sessionKey, false], { account: acct.account });
    await pm.write.setGlobalPause([true], { account: guardian.account });
    await expectRevert(pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account }), "GloballyPaused");
  });

  it("trips the circuit breaker on excessive daily loss", async () => {
    const { pm, acct, sessionKey } = await fixture();
    await configure(pm, acct, sessionKey, basePolicy({ maxLossPerDay: USD(100) }));
    await pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account });
    await pm.write.recordPnl([sessionKey, -USD(150)], { account: acct.account });
    assert.equal(await pm.read.isBroken([acct.account.address, sessionKey]), true);
    await expectRevert(pm.write.checkAndRecord([ctx(sessionKey)], { account: acct.account }), "CircuitBroken");
  });
});
