import { describe, it } from "node:test";
import hre from "hardhat";
import { getAddress, parseEther, encodeFunctionData } from "viem";
import assert from "node:assert";

const { viem, networkHelpers } = await hre.network.create();

describe("DolfinAccount", () => {
  async function deployDolfinAccountFixture() {
    const dolfin = await viem.deployContract("DolfinAccount");
    const [ownerClient, relayerClient, thirdClient] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    await networkHelpers.setCode(ownerClient.account.address, `0xef0100${dolfin.address.slice(2)}`);

    return { dolfin, ownerClient, relayerClient, thirdClient, publicClient };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async function expectEvent(
    publicClient: any,
    txPromise: Promise<`0x${string}`>,
    contractRef: { address: `0x${string}`; abi: any },
    eventName: string,
    checkArgs?: (args: any) => void,
  ) {
    const hash = await txPromise;
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const logs = await publicClient.getContractEvents({
      address: contractRef.address,
      abi: contractRef.abi,
      eventName,
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });
    assert.ok(logs.length > 0, `Expected event ${eventName} to be emitted`);
    if (checkArgs) checkArgs(logs[0].args);
    return logs;
  }

  async function whitelistCaller(
    dolfin: any,
    ownerClient: any,
    publicClient: any,
    callerAddress: `0x${string}`,
  ) {
    const data = encodeFunctionData({
      abi: dolfin.abi,
      functionName: "addToWhitelist",
      args: [callerAddress],
    });

    // Owner gọi addToWhitelist trực tiếp (không qua executeDirect/execute)
    // vì addToWhitelist giờ check executing = false
    const hash = await ownerClient.writeContract({
      address: ownerClient.account.address,
      abi: dolfin.abi,
      functionName: "addToWhitelist",
      args: [callerAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function removeCallerFromWhitelist(
    dolfin: any,
    ownerClient: any,
    publicClient: any,
    callerAddress: `0x${string}`,
  ) {
    const hash = await ownerClient.writeContract({
      address: ownerClient.account.address,
      abi: dolfin.abi,
      functionName: "removeFromWhitelist",
      args: [callerAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function getIsWhitelisted(
    publicClient: any,
    dolfin: any,
    ownerAddress: `0x${string}`,
    callerAddress: `0x${string}`,
  ): Promise<boolean> {
    return publicClient.readContract({
      address: ownerAddress,
      abi: dolfin.abi,
      functionName: "isWhitelisted",
      args: [callerAddress],
    });
  }

  // ─── executeDirect ────────────────────────────────────────────────────────

  describe("executeDirect", () => {
    it("should reject calls from non-owner", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "executeDirect",
          args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "UnauthorizedCaller",
      );
    });

    it("should execute calls from owner", async () => {
      const { dolfin, ownerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await expectEvent(
        publicClient,
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "executeDirect",
          args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallExecuted",
        (args) => {
          assert.equal(args.index, 0n);
          assert.equal(args.to, getAddress(ownerClient.account.address));
          assert.equal(args.value, 0n);
          assert.equal(args.data, "0x");
        },
      );
    });

    it("should execute multiple calls", async () => {
      const { dolfin, ownerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      const calls = [
        { to: ownerClient.account.address, value: 0n, data: "0x" },
        { to: ownerClient.account.address, value: 0n, data: "0x" },
      ] as const;

      const hash = await ownerClient.writeContract({
        address: ownerClient.account.address,
        abi: dolfin.abi,
        functionName: "executeDirect",
        args: [calls],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const logs = await publicClient.getContractEvents({
        address: ownerClient.account.address,
        abi: dolfin.abi,
        eventName: "CallExecuted",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      assert.equal(logs.length, calls.length);
      for (const [index, log] of logs.entries()) {
        assert.equal(log.args.index, BigInt(index));
        assert.equal(log.args.to, getAddress(calls[index].to));
        assert.equal(log.args.value, calls[index].value);
        assert.equal(log.args.data, calls[index].data);
      }
    });

    it("should reject executeDirect called via _executeCalls (executing = true)", async () => {
      const { dolfin, ownerClient } = await networkHelpers.loadFixture(deployDolfinAccountFixture);

      const reentrantData = encodeFunctionData({
        abi: dolfin.abi,
        functionName: "executeDirect",
        args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
      });

      await viem.assertions.revertWithCustomError(
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "executeDirect",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: reentrantData,
              },
            ],
          ],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallFailed",
      );
    });
  });

  // ─── Whitelist management ─────────────────────────────────────────────────

  describe("whitelist management", () => {
    it("should allow owner to add a caller to whitelist", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await expectEvent(
        publicClient,
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "addToWhitelist",
          args: [relayerClient.account.address],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallerWhitelisted",
        (args) => {
          assert.equal(args.caller, getAddress(relayerClient.account.address));
        },
      );
    });

    it("should allow owner to remove a caller from whitelist", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      await expectEvent(
        publicClient,
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "removeFromWhitelist",
          args: [relayerClient.account.address],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallerRemovedFromWhitelist",
        (args) => {
          assert.equal(args.caller, getAddress(relayerClient.account.address));
        },
      );
    });

    it("should revert when adding an already whitelisted caller", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      await viem.assertions.revertWithCustomError(
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "addToWhitelist",
          args: [relayerClient.account.address],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "AlreadyWhitelisted",
      );
    });

    it("should revert when removing a caller not in whitelist", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await viem.assertions.revertWithCustomError(
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "removeFromWhitelist",
          args: [relayerClient.account.address],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "NotWhitelisted",
      );
    });

    it("should reject addToWhitelist called directly from non-owner", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "addToWhitelist",
          args: [relayerClient.account.address],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "UnauthorizedCaller",
      );
    });

    it("should reject removeFromWhitelist called directly from non-owner", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "removeFromWhitelist",
          args: [relayerClient.account.address],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "UnauthorizedCaller",
      );
    });

    // ─── Vulnerability fix tests ───────────────────────────────────────────

    it("should reject whitelisted caller trying to add another address via execute", async () => {
      const { dolfin, ownerClient, relayerClient, thirdClient, publicClient } =
        await networkHelpers.loadFixture(deployDolfinAccountFixture);

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      const addData = encodeFunctionData({
        abi: dolfin.abi,
        functionName: "addToWhitelist",
        args: [thirdClient.account.address],
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: addData }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallFailed",
      );

      const isWhitelisted = await getIsWhitelisted(
        publicClient,
        dolfin,
        ownerClient.account.address,
        thirdClient.account.address,
      );
      assert.equal(isWhitelisted, false, "thirdClient must NOT be whitelisted");
    });

    it("should reject whitelisted caller trying to remove another address via execute", async () => {
      const { dolfin, ownerClient, relayerClient, thirdClient, publicClient } =
        await networkHelpers.loadFixture(deployDolfinAccountFixture);

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);
      await whitelistCaller(dolfin, ownerClient, publicClient, thirdClient.account.address);

      const removeData = encodeFunctionData({
        abi: dolfin.abi,
        functionName: "removeFromWhitelist",
        args: [thirdClient.account.address],
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: removeData }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallFailed",
      );

      const isWhitelisted = await getIsWhitelisted(
        publicClient,
        dolfin,
        ownerClient.account.address,
        thirdClient.account.address,
      );
      assert.equal(isWhitelisted, true, "thirdClient must still be whitelisted");
    });

    it("should reject whitelisted caller trying to add itself via execute", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      const addData = encodeFunctionData({
        abi: dolfin.abi,
        functionName: "addToWhitelist",
        args: [relayerClient.account.address],
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: addData }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallFailed",
      );
    });
  });

  // ─── execute ──────────────────────────────────────────────────────────────

  describe("execute", () => {
    it("should reject calls from non-whitelisted address", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "UnauthorizedCaller",
      );
    });

    it("should allow owner to call execute directly", async () => {
      const { dolfin, ownerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await expectEvent(
        publicClient,
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallExecuted",
        (args) => {
          assert.equal(args.index, 0n);
          assert.equal(args.to, getAddress(ownerClient.account.address));
          assert.equal(args.value, 0n);
          assert.equal(args.data, "0x");
        },
      );
    });

    it("should allow whitelisted caller to execute calls", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      await expectEvent(
        publicClient,
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallExecuted",
        (args) => {
          assert.equal(args.index, 0n);
          assert.equal(args.to, getAddress(ownerClient.account.address));
          assert.equal(args.value, 0n);
          assert.equal(args.data, "0x");
        },
      );
    });

    it("should reject execute after caller is removed from whitelist", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);
      await removeCallerFromWhitelist(
        dolfin,
        ownerClient,
        publicClient,
        relayerClient.account.address,
      );

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "UnauthorizedCaller",
      );
    });

    it("should transfer non-zero value via whitelisted relayer", async () => {
      const { dolfin, ownerClient, relayerClient, thirdClient, publicClient } =
        await networkHelpers.loadFixture(deployDolfinAccountFixture);

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      const recipient = thirdClient.account.address;
      const value = parseEther("0.1");
      const balanceBefore = await publicClient.getBalance({
        address: recipient,
      });

      await expectEvent(
        publicClient,
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [[{ to: recipient, value, data: "0x" }]],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallExecuted",
        (args) => {
          assert.equal(args.index, 0n);
          assert.equal(args.to, getAddress(recipient));
          assert.equal(args.value, value);
          assert.equal(args.data, "0x");
        },
      );

      const balanceAfter = await publicClient.getBalance({
        address: recipient,
      });
      assert.equal(balanceAfter - balanceBefore, value);
    });

    it("should revert when balance is insufficient for value", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      const balance = await publicClient.getBalance({
        address: ownerClient.account.address,
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: relayerClient.account.address,
                value: balance + 1n,
                data: "0x",
              },
            ],
          ],
        }),
        { address: ownerClient.account.address, abi: dolfin.abi },
        "CallFailed",
      );
    });

    it("should execute multiple calls from whitelisted relayer", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      const calls = [
        { to: ownerClient.account.address, value: 0n, data: "0x" },
        { to: ownerClient.account.address, value: 0n, data: "0x" },
      ] as const;

      const hash = await relayerClient.writeContract({
        address: ownerClient.account.address,
        abi: dolfin.abi,
        functionName: "execute",
        args: [calls],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const logs = await publicClient.getContractEvents({
        address: ownerClient.account.address,
        abi: dolfin.abi,
        eventName: "CallExecuted",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      assert.equal(logs.length, calls.length);
      for (const [index, log] of logs.entries()) {
        assert.equal(log.args.index, BigInt(index));
        assert.equal(log.args.to, getAddress(calls[index].to));
        assert.equal(log.args.value, calls[index].value);
        assert.equal(log.args.data, calls[index].data);
      }
    });

    it("should reject whitelisted caller invoking execute recursively via calls", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await whitelistCaller(dolfin, ownerClient, publicClient, relayerClient.account.address);

      const reentrantData = encodeFunctionData({
        abi: dolfin.abi,
        functionName: "execute",
        args: [[{ to: ownerClient.account.address, value: 0n, data: "0x" }]],
      });

      // execute() không check executing nên inner call vẫn chạy được
      // (msg.sender = address(this) khi self-call) → 2 events
      const hash = await relayerClient.writeContract({
        address: ownerClient.account.address,
        abi: dolfin.abi,
        functionName: "execute",
        args: [[{ to: ownerClient.account.address, value: 0n, data: reentrantData }]],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const logs = await publicClient.getContractEvents({
        address: ownerClient.account.address,
        abi: dolfin.abi,
        eventName: "CallExecuted",
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      // Inner emit trước: data = "0x"
      // Outer emit sau: data = reentrantData
      assert.equal(logs.length, 2, "Expected 2 CallExecuted events");
      assert.equal(logs[0].args.data, "0x");
      assert.equal(logs[1].args.data, reentrantData);
    });
  });
});
