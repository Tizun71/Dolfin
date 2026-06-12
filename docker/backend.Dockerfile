FROM node:24-alpine AS deps

WORKDIR /app

# All workspace manifests are needed for a frozen-lockfile install to validate the graph.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/onchain/package.json ./packages/onchain/
COPY packages/smart_contract/package.json ./packages/smart_contract/
RUN npm install -g pnpm@10 \
    && pnpm install --frozen-lockfile

FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=deps /app/packages/onchain/node_modules ./packages/onchain/node_modules
COPY . .

# onchain is consumed as built dist (workspace:*); build it so the backend can import it
# at runtime. dist is .dockerignore'd, so it must be built here.
RUN npm install -g pnpm@10 \
    && pnpm --filter @dolfin/onchain build

FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
# Run from TS source via tsx (not `node dist`): some deps (@gmx-io/sdk) ship ESM with
# extensionless imports that raw Node ESM rejects but tsx/esbuild resolves — same as dev.
COPY --from=builder /app/packages/backend/src ./packages/backend/src
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /app/packages/backend/drizzle ./packages/backend/drizzle
COPY --from=builder /app/packages/backend/drizzle.config.ts ./packages/backend/drizzle.config.ts
# onchain dist + its own node_modules (viem) that the backend imports at runtime.
COPY --from=builder /app/packages/onchain/dist ./packages/onchain/dist
COPY --from=builder /app/packages/onchain/package.json ./packages/onchain/package.json
COPY --from=deps /app/packages/onchain/node_modules ./packages/onchain/node_modules

# Apply pending migrations, then start via tsx. Both binaries live in backend's node_modules.
WORKDIR /app/packages/backend
CMD ["sh", "-c", "node_modules/.bin/drizzle-kit migrate && node_modules/.bin/tsx src/index.ts"]
