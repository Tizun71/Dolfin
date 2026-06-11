import { createPublicClient, http } from "viem";

import { ChainMetadata, type ChainId } from "../configs/chain.js";

export const getPublicClient = (chainId: ChainId) => {
    return createPublicClient({
        chain: ChainMetadata[chainId],
        transport: http(ChainMetadata[chainId].rpcUrls.default.http[0]),
    });
};
