# Local Setup

Run the full stack locally: Postgres + backend (Docker) and the frontend (host).

## Prerequisites
- Docker + Docker Compose
- Node 24 + pnpm 10 (`mise install` or install manually)

## 1. Install dependencies
```bash
pnpm install
```

## 2. Backend env
Copy the example and fill the required values:
```bash
cp packages/backend/.env.example packages/backend/.env
```

Required to boot:

| Key | Value / note |
|---|---|
| `SESSION_KEY_ENC_SECRET` | 32+ char secret — encrypts per-user session keys at rest. **Required.** |
| `AGENT_PRIVATE_KEY` | `0x` + 64 hex — used by the `ai` module at import; any valid key works for dev. |
| `ALCHEMY_RPC_URL` / `ALCHEMY_BUNDLER_URL` | Alchemy Arbitrum Sepolia URL (same value). |
| `SESSION_KEY` | Dev/smoke CLI only. Per-user agents use their own key from the DB. |

Needed when the agent actually runs (not for boot):

| Key | Value / note |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini key — the advisor node. |
| `PRIVY_APP_ID` / `PRIVY_APP_SECRET` / `PRIVY_WEBHOOK_SIGNING_SECRET` | Privy dashboard. |
| `DUNE_API_KEY` | Optional — market data. Empty = empty market context. |
| `CORS_ORIGINS` | Browser allowlist. Default `http://localhost:3000`. |

`DATABASE_URL`, `PORT`, `HOSTNAME` are overridden by `docker-compose.yml` — leave them.

> Generate secrets:
> ```bash
> node -e "console.log('SESSION_KEY_ENC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
> node -e "console.log('AGENT_PRIVATE_KEY=0x' + require('crypto').randomBytes(32).toString('hex'))"
> ```

## 3. Backend + Postgres (Docker)
```bash
docker compose up -d --build
```
- Backend → `http://localhost:8080`, Postgres → `localhost:5432`.
- Migrations run automatically on container start.
- Logs: `docker compose logs -f backend`. Look for `Server is running on 0.0.0.0:8080`.

## 4. Frontend env
`frontend/.env` needs:
```
NEXT_PUBLIC_PRIVY_APP_ID=<privy app id>
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
PRIVY_APP_SECRET=<privy app secret>
```

## 5. Frontend (host)
```bash
pnpm --filter frontend dev
```
Open `http://localhost:3000`.

## Verify
```bash
curl http://localhost:8080/            # 404 from Hono = server is up (no root route)
```
On the agents page: create an account → create an agent (owner signs `configureSession`) →
the session key + policy sync to the backend → "AI Agent Activity" panel shows runs; "Run Now"
triggers one on demand.

## Common issues
- **CORS error** → set `CORS_ORIGINS` to the frontend origin, rebuild backend.
- **PUT /config 500, FK violation** → fixed (handler upserts the user row); rebuild if on old image.
- **Backend exits on boot, `invalid private key`** → `AGENT_PRIVATE_KEY` empty. Set it.
- **`SESSION_KEY_ENC_SECRET` missing** → config writes/reads throw. Set it.
- **Code change not reflected** → backend bakes source at build: `docker compose up -d --build backend`.

## Teardown
```bash
docker compose down        # keep data
docker compose down -v     # drop the Postgres volume too
```
