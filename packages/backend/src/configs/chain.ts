import { defineChain } from "viem"
import { arbitrum, arbitrumSepolia, type Chain } from "viem/chains"

enum ChainId {
    ARBITRUM = 42161,
    ARBITRUM_SEPOLIA = 421614,
    ROBINHOOD_TESTNET = 46630,
}

/**
 * Robinhood Chain testnet (Arbitrum Orbit L2, settles to Ethereum Sepolia).
 * Not bundled in viem/chains, so we define it. Public RPC is rate-limited; set
 * ROBINHOOD_RPC_URL (e.g. an Alchemy endpoint) for anything beyond light reads.
 */
const robinhoodTestnet = defineChain({
    id: ChainId.ROBINHOOD_TESTNET,
    name: "Robinhood Chain Testnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: {
            http: [process.env.ROBINHOOD_RPC_URL ?? "https://rpc.testnet.chain.robinhood.com"],
        },
    },
    blockExplorers: {
        default: { name: "Blockscout", url: "https://explorer.testnet.chain.robinhood.com" },
    },
    testnet: true,
})

const ChainMetadata: Record<ChainId, Chain> = {
    [ChainId.ARBITRUM]: arbitrum,
    [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia,
    [ChainId.ROBINHOOD_TESTNET]: robinhoodTestnet,
}

export {
    ChainId,
    ChainMetadata
}