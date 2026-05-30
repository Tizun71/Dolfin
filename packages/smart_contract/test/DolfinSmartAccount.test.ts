import { describe, it } from "node:test";
import hre from "hardhat";
import assert from "node:assert";
import { encodeFunctionData, encodeAbiParameters, concat, parseEther } from "viem";

const { viem } = await hre.network.create();

const USD = (n: number) => BigInt(Math.round(n)) * 10n ** 18n;
const SALT = 1234n;
const A = { SWAP: 0, SUPPLY: 1, WITHDRAW: 2, BORROW: 3, REPAY: 4, OPEN_PERP: 5, CLOSE_PERP: 6 };
const bit = (a: number) => 1n << BigInt(a);

function pack(hi: bigint, lo: bigint): `0x${string}` {
  return `0x${((hi << 128n) | lo).toString(16).padStart(64, "0")}` as `0x${string}`;
}

async function expectRevert(p: Promise<unknown>, needle?: string) {
  try {
    await p;
    assert.fail("expected revert");
  } catch (e: any) {
    if (needle) {
      const msg = (e?.shortMessage ?? "") + (e?.message ?? "");
      assert.ok(msg.includes(needle), `expected "${needle}" in: ${msg.slice(0, 300)}`);
    }
  }
}

// adapter actionData encoders
function uniData(router: string, tokenIn: string, tokenOut: string, amountIn: bigint) {
  return encodeAbiParameters(
    [
      { type: "address" }, { type: "address" }, { type: "address" }, { type: "uint24" },
      { type: "uint256" }, { type: "uint256" }, { type: "uint256" },
    ],
    [router, tokenIn, tokenOut, 3000, amountIn, 1n, 2_000_000_000n],
  );
}
function aaveData(action: number, pool: string, asset: string, amount: bigint) {
  return encodeAbiParameters(
    [{ type: "uint8" }, { type: "address" }, { type: "address" }, { type: "uint256" }, { type: "uint256" }],
    [action, pool, asset, amount, 2n],
  );
}
function gmxData(action: number, router: string, coll: string, index: string, amount: bigint, lev: number) {
  return encodeAbiParameters(
    [
      { type: "uint8" }, { type: "address" }, { type: "address" }, { type: "address" },
      { type: "uint256" }, { type: "uint16" }, { type: "bool" },
    ],
    [action, router, coll, index, amount, lev, true],
  );
}

describe("DolfinSmartAccount (ERC-4337 e2e, multi-protocol)", () => {
  async function fixture() {
    const [owner, bundler, agent, guardian] = await viem.getWalletClients();
    const pub = await viem.getPublicClient();

    const entryPoint = await viem.deployContract("TestEntryPoint");
    const pm = await viem.deployContract("PolicyManager", [guardian.account.address, guardian.account.address]);
    const factory = await viem.deployContract("DolfinAccountFactory", [entryPoint.address, pm.address]);

    const usdc = await viem.deployContract("MockERC20", ["USD Coin", "USDC", 6]);
    const weth = await viem.deployContract("MockERC20", ["Wrapped Ether", "WETH", 18]);
    const uni = await viem.deployContract("MockSwapRouter");
    const aave = await viem.deployContract("MockAavePool");
    const gmx = await viem.deployContract("MockGmxRouter");
    const uniAdapter = await viem.deployContract("UniswapV3Adapter");
    const aaveAdapter = await viem.deployContract("AaveV3Adapter");
    const gmxAdapter = await viem.deployContract("GmxAdapter");

    await pm.write.setPrice([usdc.address, USD(1)], { account: guardian.account });
    await pm.write.setPrice([weth.address, USD(3000)], { account: guardian.account });
    await uni.write.setRate([10n ** 18n / 3000n]);

    const accountAddr = (await factory.read.getAddress([owner.account.address, SALT])) as `0x${string}`;
    await factory.write.createAccount([owner.account.address, SALT]);
    const account = await viem.getContractAt("DolfinSmartAccount", accountAddr);

    await usdc.write.mint([accountAddr, 1_000_000n * 10n ** 6n]);
    await weth.write.mint([uni.address, 1000n * 10n ** 18n]);
    await usdc.write.mint([aave.address, 1_000_000n * 10n ** 6n]); // borrow liquidity
    await owner.sendTransaction({ to: accountAddr, value: parseEther("1") });

    const policy = {
      expiry: 2_000_000_000n,
      maxTradePerTx: USD(100),
      maxDailyVolume: USD(1000),
      maxExposure: USD(5000),
      maxLossPerDay: USD(200),
      maxDrawdownBps: 5000,
      maxLeverageBps: 30000,
      exists: true,
      paused: false,
    };
    await account.write.configureSession(
      [
        agent.account.address,
        2_000_000_000n,
        policy,
        [uniAdapter.address, aaveAdapter.address, gmxAdapter.address],
        [usdc.address, weth.address],
        [
          { protocol: uni.address, actionMask: bit(A.SWAP) },
          { protocol: aave.address, actionMask: bit(A.SUPPLY) | bit(A.BORROW) | bit(A.WITHDRAW) | bit(A.REPAY) },
          { protocol: gmx.address, actionMask: bit(A.OPEN_PERP) | bit(A.CLOSE_PERP) },
        ],
      ],
      { account: owner.account },
    );

    return {
      entryPoint, pm, account, accountAddr, usdc, weth, uni, aave, gmx,
      uniAdapter, aaveAdapter, gmxAdapter, owner, bundler, agent, pub,
    };
  }

  async function runAction(ctx: any, adapter: string, actionData: `0x${string}`, signer = ctx.agent) {
    const { entryPoint, account, accountAddr, bundler, pub } = ctx;
    const callData = encodeFunctionData({
      abi: account.abi,
      functionName: "executeAction",
      args: [adapter, actionData],
    });
    const nonce = (await entryPoint.read.getNonce([accountAddr, 0n])) as bigint;
    const userOp = {
      sender: accountAddr,
      nonce,
      initCode: "0x" as `0x${string}`,
      callData,
      accountGasLimits: pack(800_000n, 800_000n),
      preVerificationGas: 100_000n,
      gasFees: pack(1_000_000_000n, 20_000_000_000n),
      paymasterAndData: "0x" as `0x${string}`,
      signature: "0x" as `0x${string}`,
    };
    const userOpHash = (await entryPoint.read.getUserOpHash([userOp])) as `0x${string}`;
    const sig = await signer.signMessage({ message: { raw: userOpHash } });
    userOp.signature = concat(["0x01", sig]);
    const hash = await entryPoint.write.handleOps([[userOp], bundler.account.address], {
      account: bundler.account,
      gas: 12_000_000n,
    });
    await pub.waitForTransactionReceipt({ hash });
  }

  it("Uniswap: AI swap within policy moves funds + records volume", async () => {
    const ctx = await fixture();
    const { weth, accountAddr, pm, agent, uni, usdc, uniAdapter } = ctx;
    const before = (await weth.read.balanceOf([accountAddr])) as bigint;
    await runAction(ctx, uniAdapter.address, uniData(uni.address, usdc.address, weth.address, 90n * 10n ** 6n));
    assert.ok(((await weth.read.balanceOf([accountAddr])) as bigint) > before);
    assert.equal(await pm.read.dayVolume([accountAddr, agent.account.address]), USD(90));
    assert.equal(await usdc.read.allowance([accountAddr, uni.address]), 0n); // no standing approval
  });

  it("Aave: AI supplies collateral", async () => {
    const ctx = await fixture();
    const { aave, accountAddr, pm, agent, usdc, aaveAdapter } = ctx;
    await runAction(ctx, aaveAdapter.address, aaveData(0, aave.address, usdc.address, 50n * 10n ** 6n));
    assert.equal(await aave.read.supplied([accountAddr, usdc.address]), 50n * 10n ** 6n);
    assert.equal(await pm.read.dayVolume([accountAddr, agent.account.address]), USD(50));
  });

  it("Aave: AI borrows against policy exposure", async () => {
    const ctx = await fixture();
    const { aave, accountAddr, pm, agent, usdc, aaveAdapter } = ctx;
    const before = (await usdc.read.balanceOf([accountAddr])) as bigint;
    await runAction(ctx, aaveAdapter.address, aaveData(2, aave.address, usdc.address, 40n * 10n ** 6n));
    assert.equal(await aave.read.debt([accountAddr, usdc.address]), 40n * 10n ** 6n);
    assert.equal((await usdc.read.balanceOf([accountAddr])) as bigint, before + 40n * 10n ** 6n);
    assert.equal(await pm.read.exposure([accountAddr, agent.account.address]), USD(40));
  });

  it("GMX: AI opens a leveraged perp (collateral x leverage notional)", async () => {
    const ctx = await fixture();
    const { gmx, accountAddr, pm, agent, usdc, weth, gmxAdapter } = ctx;
    await runAction(
      ctx,
      gmxAdapter.address,
      gmxData(0, gmx.address, usdc.address, weth.address, 20n * 10n ** 6n, 30000),
    );
    const pos = (await gmx.read.positions([accountAddr])) as any;
    assert.equal(pos[0], 20n * 10n ** 6n); // collateral escrowed
    assert.equal(pos[1], 60n * 10n ** 6n); // sizeUsd = collateral * 3x
    assert.equal(await pm.read.exposure([accountAddr, agent.account.address]), USD(60)); // $20 * 3x
  });

  it("rejects a policy-violating trade (over maxTradePerTx) without moving funds", async () => {
    const ctx = await fixture();
    const { weth, accountAddr, pm, agent, uni, usdc, uniAdapter } = ctx;
    const before = (await weth.read.balanceOf([accountAddr])) as bigint;
    await runAction(ctx, uniAdapter.address, uniData(uni.address, usdc.address, weth.address, 500n * 10n ** 6n));
    assert.equal((await weth.read.balanceOf([accountAddr])) as bigint, before);
    assert.equal(await pm.read.dayVolume([accountAddr, agent.account.address]), 0n);
  });

  it("rejects an untrusted adapter (owner direct call)", async () => {
    const ctx = await fixture();
    const { account, owner, uni, usdc, weth } = ctx;
    const fakeAdapter = "0x000000000000000000000000000000000000dEaD";
    await expectRevert(
      account.write.executeAction([fakeAdapter, uniData(uni.address, usdc.address, weth.address, 1n)], {
        account: owner.account,
      }),
      "AdapterNotTrusted",
    );
  });

  it("rejects a revoked session key at validation", async () => {
    const ctx = await fixture();
    const { account, agent, owner, uni, usdc, weth, uniAdapter } = ctx;
    await account.write.revokeSessionKey([agent.account.address], { account: owner.account });
    await expectRevert(
      runAction(ctx, uniAdapter.address, uniData(uni.address, usdc.address, weth.address, 50n * 10n ** 6n)),
      "",
    );
  });
});
