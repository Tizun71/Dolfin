import { describe, it } from "node:test";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import assert from "node:assert";

const { viem, networkHelpers } = await hre.network.create();

describe("DolfinAccount", () => {
  async function deployDolfinAccountFixture() {
    // Deploy implementation contract
    const dolfin = await viem.deployContract("DolfinAccount");

    // Get test wallets
    const [ownerClient, relayerClient] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    // Install EIP-7702 delegation designator into owner EOA
    await networkHelpers.setCode(ownerClient.account.address, `0xef0100${dolfin.address.slice(2)}`);

    return {
      dolfin,
      ownerClient,
      relayerClient,
      publicClient,
    };
  }

  describe("executeDirect", () => {
    it("should reject calls from relayer", async () => {
      const { dolfin, relayerClient, ownerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "executeDirect",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
          ],
        }),
        dolfin,
        "UnauthorizedCaller",
      );
    });

    it("should execute calls from owner", async () => {
      const { dolfin, ownerClient } = await networkHelpers.loadFixture(deployDolfinAccountFixture);

      await viem.assertions.emitWithArgs(
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "executeDirect",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "CallExecuted",
        [0n, getAddress(ownerClient.account.address), 0n, "0x"],
      );
    });

    it("should execute multiple calls", async () => {
      const { dolfin, ownerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      const calls = [
        {
          to: ownerClient.account.address,
          value: 0n,
          data: "0x",
        },
        {
          to: ownerClient.account.address,
          value: 0n,
          data: "0x",
        },
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

      // Ensure all events emitted
      assert.equal(logs.length, calls.length, "Unexpected number of CallExecuted events");

      // Assert every emitted event
      for (const [index, log] of logs.entries()) {
        const expectedCall = calls[index];
        assert.equal(log.args.index, index);
        assert.equal(log.args.to, getAddress(expectedCall.to));
        assert.equal(log.args.value, expectedCall.value);
        assert.equal(log.args.data, expectedCall.data);
      }
    });
  });

  describe("execute", () => {
    const types = {
      Call: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
      ],
      Execute: [
        { name: "calls", type: "Call[]" },
        { name: "nonce", type: "uint256" },
      ],
    } as const;

    it("should reject wrong signer", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      // Sign with WRONG signer
      const invalidSignature = await relayerClient.signTypedData({
        domain: {
          name: "DolfinAccount",
          version: "1",
          chainId: await relayerClient.getChainId(),
          verifyingContract: ownerClient.account.address,
        },
        types,
        primaryType: "Execute",
        message: {
          calls: [
            {
              to: ownerClient.account.address,
              value: 0n,
              data: "0x",
            },
          ],
          nonce: 0n,
        },
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
            invalidSignature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "InvalidSignature",
      );
    });

    it("should reject wrong nonce", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      // Sign with WRONG nonce
      const invalidSignature = await ownerClient.signTypedData({
        domain: {
          name: "DolfinAccount",
          version: "1",
          chainId: await relayerClient.getChainId(),
          verifyingContract: ownerClient.account.address,
        },
        types,
        primaryType: "Execute",
        message: {
          calls: [
            {
              to: ownerClient.account.address,
              value: 0n,
              data: "0x",
            },
          ],
          nonce: 1000n, // The initial nonce is 0, so 1000 is invalid
        },
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
            invalidSignature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "InvalidSignature",
      );
    });

    it("should execute calls with valid signature", async () => {
      const { dolfin, ownerClient } = await networkHelpers.loadFixture(deployDolfinAccountFixture);

      // Sign with correct signer and nonce
      const validSignature = await ownerClient.signTypedData({
        domain: {
          name: "DolfinAccount",
          version: "1",
          chainId: await ownerClient.getChainId(),
          verifyingContract: ownerClient.account.address,
        },
        types,
        primaryType: "Execute",
        message: {
          calls: [
            {
              to: ownerClient.account.address,
              value: 0n,
              data: "0x",
            },
          ],
          nonce: 0n,
        },
      });

      await viem.assertions.emitWithArgs(
        ownerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
            validSignature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "CallExecuted",
        [0n, getAddress(ownerClient.account.address), 0n, "0x"],
      );
    });

    it("should transfer non-zero value", async () => {
      const { dolfin, ownerClient, relayerClient, publicClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      const wallets = await viem.getWalletClients();
      const recipient = wallets[2].account.address;
      const value = parseEther("0.1");
      const balanceBefore = await publicClient.getBalance({
        address: recipient,
      });

      const signature = await ownerClient.signTypedData({
        domain: {
          name: "DolfinAccount",
          version: "1",
          chainId: await ownerClient.getChainId(),
          verifyingContract: ownerClient.account.address,
        },
        types,
        primaryType: "Execute",
        message: {
          calls: [
            {
              to: recipient,
              value,
              data: "0x",
            },
          ],
          nonce: 0n,
        },
      });

      await viem.assertions.emitWithArgs(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: recipient,
                value,
                data: "0x",
              },
            ],
            signature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "CallExecuted",
        [0n, getAddress(recipient), value, "0x"],
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

      const recipient = relayerClient.account.address;
      const balance = await publicClient.getBalance({
        address: ownerClient.account.address,
      });
      const value = balance + 1n;

      const signature = await ownerClient.signTypedData({
        domain: {
          name: "DolfinAccount",
          version: "1",
          chainId: await ownerClient.getChainId(),
          verifyingContract: ownerClient.account.address,
        },
        types,
        primaryType: "Execute",
        message: {
          calls: [
            {
              to: recipient,
              value,
              data: "0x",
            },
          ],
          nonce: 0n,
        },
      });

      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: recipient,
                value,
                data: "0x",
              },
            ],
            signature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "CallFailed",
      );
    });

    it("should reject replayed signature", async () => {
      const { dolfin, ownerClient, relayerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

      // Sign with correct signer and nonce
      const validSignature = await ownerClient.signTypedData({
        domain: {
          name: "DolfinAccount",
          version: "1",
          chainId: await ownerClient.getChainId(),
          verifyingContract: ownerClient.account.address,
        },
        types,
        primaryType: "Execute",
        message: {
          calls: [
            {
              to: ownerClient.account.address,
              value: 0n,
              data: "0x",
            },
          ],
          nonce: 0n,
        },
      });

      // First execution should succeed
      await viem.assertions.emitWithArgs(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
            validSignature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "CallExecuted",
        [0n, getAddress(ownerClient.account.address), 0n, "0x"],
      );

      // Second execution with the same signature should fail due to nonce increment
      await viem.assertions.revertWithCustomError(
        relayerClient.writeContract({
          address: ownerClient.account.address,
          abi: dolfin.abi,
          functionName: "execute",
          args: [
            [
              {
                to: ownerClient.account.address,
                value: 0n,
                data: "0x",
              },
            ],
            validSignature,
          ],
        }),
        {
          address: ownerClient.account.address,
          abi: dolfin.abi,
        },
        "InvalidSignature",
      );
    });
  });
});
