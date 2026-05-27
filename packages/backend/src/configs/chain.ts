import { arbitrum, type Chain } from "viem/chains"

enum ChainId {
    ARBITRUM = 42161,
}

const ChainMetadata: Record<ChainId, Chain> = {
    [ChainId.ARBITRUM]: arbitrum,
}

export {
    ChainId,
    ChainMetadata
}