import { createPublicClient, createWalletClient, http } from "viem";

import { privateKeyToAccount, type Address } from "viem/accounts";

import { ChainMetadata, type ChainId } from "../configs/chain.js";
import { PrivateKeySigner } from "@gmx-io/sdk/v2";

export const getPublicClient = (chainId: ChainId) => {
    return createPublicClient({
        chain: ChainMetadata[chainId],
        transport: http(ChainMetadata[chainId].rpcUrls.default.http[0]),
    });
};

export const getWalletClient = (chainId: ChainId, privateKey: Address) => {
    return createWalletClient({
        account: privateKeyToAccount(privateKey),
        chain: ChainMetadata[chainId],
        transport: http(ChainMetadata[chainId].rpcUrls.default.http[0]),
    });
};

export const getAgentGMXClient = (chainId: ChainId) => {
    return new PrivateKeySigner(
        process.env.AGENT_PRIVATE_KEY as `0x${string}`,
        { chain: ChainMetadata[chainId] },
    );
};