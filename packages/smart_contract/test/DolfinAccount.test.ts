import { describe, it } from "node:test";
import hre from "hardhat";
import { getAddress } from "viem";

const { viem, networkHelpers } = await hre.network.create();

describe("DolfinAccount (EIP-7702)", () => {
  async function deployDolfinAccountFixture() {
    // Deploy implementation contract
    const dolfin = await viem.deployContract("DolfinAccount");

    // Get test wallets
    const [ownerClient, relayerClient] = await viem.getWalletClients();

    // Install EIP-7702 delegation designator into owner EOA
    await networkHelpers.setCode(
      ownerClient.account.address,
      `0xef0100${dolfin.address.slice(2)}`,
    );

    return {
      dolfin,
      ownerClient,
      relayerClient,
    };
  }

  describe("executeDirect", () => {
    it("should reject calls from relayer", async () => {
      const { dolfin, relayerClient, ownerClient } =
        await networkHelpers.loadFixture(deployDolfinAccountFixture);

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
      const { dolfin, ownerClient } = await networkHelpers.loadFixture(
        deployDolfinAccountFixture,
      );

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
  });
});
