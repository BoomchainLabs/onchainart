# Workspace

## Overview

Full-stack OnChainArt platform: generative SVG NFT smart contracts (Foundry/Solidity) + a web gallery (React + Vite) + a REST API (Express 5 + PostgreSQL).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Smart contracts**: Foundry (Solidity ^0.8.20)
- **Web3 client**: viem

## Project Structure

```
artifacts/
  api-server/      — Express REST API
  onchain-art/     — React + Vite web gallery frontend
  mockup-sandbox/  — Design mockup sandbox (Canvas)
lib/
  api-spec/        — OpenAPI spec (source of truth for API)
  api-client-react/— Generated React Query hooks
  api-zod/         — Generated Zod validation schemas
  db/              — Drizzle ORM schema + DB client
packages/
  foundry/         — Solidity smart contracts
    src/OnChainArt.sol          — ERC-721 on-chain SVG NFT contract
    test/OnChainArt.t.sol       — 20 Forge unit tests (all passing)
    script/DeployOnChainArt.s.sol — Deployment script
```

## Smart Contract: OnChainArt.sol

A fully on-chain ERC-721 NFT contract where SVG art is stored on-chain.

Key features:
- `mint(title, svgData)` — payable, stores SVG entirely on-chain
- `tokenURI(tokenId)` — returns base64-encoded JSON with embedded SVG
- `updateTitle(tokenId, newTitle)` — owner can rename their art
- `getArt(tokenId)` — returns ArtPiece struct
- `withdraw()` — admin withdraws ETH
- Configurable `mintPrice`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

### Foundry Commands (run from packages/foundry)

```bash
export FOUNDRY_DIR="/home/runner/workspace/.config/.foundry"
export PATH="$FOUNDRY_DIR/bin:$PATH"

forge build                          # compile contracts
forge test -vvv                      # run all tests with verbose output
anvil                                # start local Ethereum node
forge script script/DeployOnChainArt.s.sol --broadcast --rpc-url localhost
```

## Database Schema

- `deployments` — contract deployment records (address, network, chainId, mintPrice)
- `mints` — NFT mint events (tokenId, title, artistAddress, txHash)

## API Routes

- `GET /api/healthz` — health check
- `GET /api/art/deployments` — list deployments
- `POST /api/art/deployments` — save a new deployment
- `GET /api/art/deployments/:id` — get single deployment
- `GET /api/art/mints?limit=&deploymentId=` — list mints
- `POST /api/art/mints` — record a mint
- `GET /api/art/stats` — aggregate stats

## Environment Variables & Secrets

- `DEPLOYER_PRIVATE_KEY` — deployer wallet private key (Replit Secret)
- `DATABASE_URL` + PG* — database connection (auto-provisioned)
- `SESSION_SECRET` — session secret

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
