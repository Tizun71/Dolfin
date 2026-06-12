<div align="center">

<img src="./frontend/public/dolfin-logo.png" alt="Dolfin Logo" width="180"/>

# Dolfin

**Your AI portfolio manager for DeFi. It invests for you, and you stay in control.**

<em>Set your rules once. An AI agent watches the market 24/7 and moves your money safely, on-chain, within limits you choose.</em>

</div>

---

## ⚡ Overview

**Dolfin** lets you hand the day-to-day work of DeFi investing to an AI agent, without handing over your keys.

You deposit funds into a smart account that you own. You set the rules: how much it can trade, which tokens it can touch, how much risk you tolerate. From there, the AI agent reads the market around the clock, builds a strategy, and executes lending, swaps, and trades for you. But **every single action is checked against your rules by a smart contract before it can happen.**

> You only need to: deposit funds, pick your tokens, and set your risk limits.</br>
> Dolfin will: find the best opportunities, manage your portfolio, and execute trades, only ever within the limits you set.

### Why Dolfin

DeFi rewards people who watch the market constantly and react fast. Most of us can't. Existing "auto" tools usually mean giving a bot full custody of your money and hoping it behaves.

Dolfin removes that trade-off. The AI gets a **session key**, which is a limited permission slip rather than your wallet. A smart contract policy engine enforces hard limits on-chain that even the AI cannot break:

- **You keep custody.** Funds live in *your* smart account. The agent can never withdraw to itself.
- **Rules are enforced by code, not trust.** Per-trade caps, daily caps, total exposure, daily loss limits, token whitelist, and an expiry date, all checked on-chain on every action.
- **Kill switch.** Pause the agent or revoke its key any time.

---

## 🧠 How It Works

```
  Deposit & set rules        AI agent runs (24/7)            On-chain guardrails
 ┌──────────────────┐      ┌─────────────────────┐        ┌─────────────────────┐
 │ Smart Account     │      │ 1. Read portfolio    │        │ PolicyManager        │
 │ (you own it)      │ ───▶ │ 2. Assess risk       │ ─────▶ │ checks EVERY action: │
 │ + risk policy     │      │ 3. Scan market       │        │  • per-trade cap     │
 │ + session key     │      │ 4. Build strategy    │        │  • daily cap         │
 │   for the agent   │      │ 5. Plan & execute    │        │  • exposure / loss   │
 └──────────────────┘      └─────────────────────┘        │  • token whitelist   │
                                                            │  • expiry / pause    │
                                                            └─────────────────────┘
                                                          reject if any rule broken
```

### The AI Agent Pipeline

The agent is a step-by-step decision pipeline (built with LangGraph). Each run:

1. **Portfolio:** read your current positions across chains
2. **Risk:** measure how risky those positions are right now
3. **Market:** scan DeFi protocols (Aave, Morpho) for the best yields and opportunities
4. **Strategy:** let the LLM propose moves, then filter them through deterministic rules
5. **Validation:** drop anything that would violate your policy *before* spending gas
6. **Plan and Execute:** turn approved decisions into on-chain transactions via protocol adapters
7. **Receipt and Advisor:** record what happened and explain it to you in plain language

---

## 🏗️ Architecture

Dolfin is a monorepo with five parts:

| Package | What it does | Tech |
|---------|-------------|------|
| **`smart_contract`** | The on-chain trust layer: smart accounts, the policy engine, and protocol adapters | Solidity 0.8.28, Hardhat, ERC-4337 (Account Abstraction v0.8) |
| **`backend`** | The AI agent, market discovery, risk/portfolio engines, and REST API | TypeScript, Hono, LangGraph, Drizzle + Postgres |
| **`subgraph`** | Indexes on-chain events so the app can read history fast | The Graph |
| **`onchain`** | Shared contract clients and types used by the backend | TypeScript, viem |
| **`frontend`** | The dashboard: connect, set rules, watch the agent work | Next.js 16, React 19, Privy, Recharts, Three.js |

### Smart Contracts

- **`DolfinSmartAccount`** is an ERC-4337 smart account you own. You have full control, while the AI's session key can *only* call whitelisted protocol adapters, and every call is checked by the PolicyManager. Adapters never hold your funds, and token approvals are granted exactly per-trade and reset to zero afterward.
- **`PolicyManager`** is the policy engine. It stores the rules you grant to each session key and enforces them on every swap, lend, borrow, or perp: token whitelist, per-tx and daily caps, exposure, daily-loss circuit breaker, leverage, expiry, and a global pause.
- **`DolfinAccountFactory`** is a CREATE2 factory, so your account address is known before it's even deployed.
- **Adapters** (`AaveV3Adapter`, `UniswapV3Adapter`, `GmxAdapter`) are stateless planners that translate an intended action into a protocol call.

### Supported

- **Chains:** Arbitrum, Arbitrum Sepolia, Robinhood Chain Testnet
- **Protocols:** Aave V3, Morpho, Uniswap V3, GMX
- **LLM:** any OpenAI-compatible model via OpenRouter (default: `google/gemini-2.5-flash-lite`)

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| **Node.js** | 24 | `node -v` |
| **pnpm** | 10 | `pnpm -v` |
| **PostgreSQL** | 14+ | `psql --version` |

> Tip: [`mise`](https://github.com/jdx/mise) can install the right Node and pnpm for you. Just run `mise install`.

### 1. Install

```bash
pnpm install
```

### 2. Configure

Each package has its own `.env`. Copy the examples and fill in the values:

```bash
# Backend: database, LLM key, RPC URLs
cp packages/backend/.env.example packages/backend/.env

# Smart contracts: deployer key, RPC, bundler, session key
cp packages/smart_contract/.env.example packages/smart_contract/.env
```

**Backend essentials:**

```env
DATABASE_URL=postgres://user:pass@localhost:5432/dolfin
OPENROUTER_API_KEY=your_key          # https://openrouter.ai
OPENROUTER_MODEL=google/gemini-2.5-flash-lite
```

**Smart contract essentials:**

```env
PRIVATE_KEY=...            # deployer EOA (fund with Arbitrum Sepolia ETH)
ALCHEMY_RPC_URL=...
ALCHEMY_BUNDLER_URL=...
SESSION_KEY=...
```

### 3. Set up the database

```bash
pnpm --filter backend drizzle:migrate
```

### 4. Run

```bash
# Frontend at http://localhost:3000
pnpm --filter frontend dev

# Backend API
pnpm --filter backend dev
```

### 5. (Optional) Deploy contracts

```bash
cd packages/smart_contract
pnpm build                 # compile
pnpm deploy:stack          # deploy the protocol contracts
pnpm configure-session     # create and configure a smart account
```

### Run the agent once (manually)

```bash
pnpm --filter backend agent:run
```

The backend also runs the agent on a schedule (cron) for every enabled account automatically.

---

## 🐳 Docker

```bash
# Frontend
docker build -f docker/frontend.Dockerfile -t dolfin-frontend .

# Backend
docker build -f docker/backend.Dockerfile -t dolfin-backend .
```

Or use Docker Compose:

```bash
docker compose up -d
```

---

## 🔐 Security Model

The whole point of Dolfin is that **you never have to trust the AI with custody.** Here's why:

1. **The agent uses a session key, not your wallet.** It can sign actions, but only the kind you allowed.
2. **The PolicyManager is the gatekeeper.** Only *you* (the account owner) can write your policy. The agent and relayer have no power to change rules. Every action runs through the policy check on-chain, and if it breaks a limit, the transaction reverts.
3. **Adapters never touch your funds.** They only describe *what* call to make. The account approves the exact amount needed and revokes it right after.
4. **Hard stops.** Daily loss too high? The circuit breaker trips. Key expired? It stops working. Want out now? Pause the account or revoke the key.

---

## 📁 Project Structure

```
Dolfin/
├── packages/
│   ├── smart_contract/   # Solidity: smart accounts, PolicyManager, adapters
│   ├── backend/          # AI agent (LangGraph), engines, REST API
│   ├── subgraph/         # The Graph indexer
│   └── onchain/          # shared viem clients & types
├── frontend/             # Next.js dashboard
├── docker/               # Dockerfiles
└── docs/                 # setup & internal docs
```

---

<div align="center">
<em>Dolfin. DeFi that works for you, on your terms.</em>
</div>
