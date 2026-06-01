import { arbitrum, arbitrumSepolia, type Chain } from "viem/chains"

enum ChainId {
    ARBITRUM = 42161,
    ARBITRUM_SEPOLIA = 421614,
}

const ChainMetadata: Record<ChainId, Chain> = {
    [ChainId.ARBITRUM]: arbitrum,
    [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia,
}

export {
    ChainId,
    ChainMetadata
}