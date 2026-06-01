### Smart Contract Setup

```bash
cd packages/smart_contract

# Create the environment file and populate the required values
cp .env.example .env

# Required variables:
# - PRIVATE_KEY
# - ALCHEMY_RPC_URL
# - ALCHEMY_BUNDLER_URL
# - SESSION_KEY

# Fund the deployer EOA with Arbitrum Sepolia ETH
pnpm build                 # Compile contract artifacts
pnpm deploy:stack          # Deploy the protocol contracts
pnpm configure-session     # Create and configure a Smart Account
```

