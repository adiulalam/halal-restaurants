# UK Halal Restaurants Monorepo

A scalable TypeScript monorepo powered by **Nx**, providing dedicated mobile & web applications for **Halal KFC UK** and **Halal Nando's UK**, backed by a reverse-engineered discovery pipeline, a **BullMQ** background job queue engine, a **Prisma 7** SQLite database, and a high-performance **Fastify REST API**.

---

## 1. Monorepo Architecture

```text
halal-restaurants/
├── apps/
│   ├── mobile-kfc/               # React Native / Expo app for Halal KFC UK (Web + Android + iOS)
│   ├── mobile-nandos/            # React Native / Expo app for Halal Nando's UK (Web + Android + iOS)
│   ├── api/                      # Fastify REST API providing search, nearby geo-queries & stats
│   └── worker/                   # BullMQ background worker executing periodic scrapers
│
├── libs/
│   ├── ui/                       # Shared React Native & Web component library (Design System)
│   │   ├── components.tsx        # HalalBadge, AmenityChip, RestaurantCard (React.memo optimized)
│   │   ├── theme.tsx             # KFC & Nando's brand theme tokens
│   │   └── query.ts              # TanStack Query hook with offline bundled JSON fallback
│   │
│   ├── database/                 # Prisma 7 database layer with LibSQL adapter
│   │   ├── prisma/               # schema.prisma, dev.db (1,551 UK stores seeded)
│   │   ├── src/chains/           # Extensible per-restaurant database adapters (kfc.ts, nandos.ts)
│   │   └── src/queries.ts        # Pluggable multi-chain search, nearby geo-search & stats
│   │
│   ├── jobs/                     # BullMQ background job definitions & repeat schedulers
│   │   ├── src/chains/           # Per-restaurant sync processors (kfc.ts, nandos.ts)
│   │   ├── src/workers.ts        # Dynamic worker dispatching to registered chain handlers
│   │   └── src/scheduler.ts      # Repeatable cron triggers (daily at 03:00 AM)
│   │
│   ├── scrapers/                 # Zero-API reverse-engineered extraction clients
│   │   ├── src/kfc.ts            # KFC UK direct API client (1,061 stores, 225 Halal)
│   │   └── src/nandos.ts         # Nando's UK RSC stream parser (490 stores, 107 Halal)
│   │
│   └── types/                    # Shared TypeScript interfaces & Zod validation schemas
│       ├── src/common.ts         # MobileRestaurantItem, RestaurantQuery, NearbyQuery
│       └── src/chains/           # Per-restaurant schemas (chains/kfc.ts, chains/nandos.ts)
│
├── docker/
│   ├── docker-compose.yml        # Redis broker, Bull-Board UI, API service, and Worker stack
│   ├── Dockerfile.api            # Multi-stage production container for Fastify API
│   └── Dockerfile.worker         # Multi-stage production container for BullMQ Worker
│
├── prisma.config.ts              # Prisma 7 configuration file (replaces schema url)
├── eslint.config.mjs             # ESLint flat config with TypeScript rules
└── package.json                  # Root workspace manifests & device scripts
```

---

## 2. Quick Start & Available Scripts

### Mobile & Web Applications

Run on your browser, iOS simulator, or Android device/emulator:

```bash
# Halal KFC UK App
npm run start:kfc:web       # Launch KFC App in Web Browser (Responsive desktop view)
npm run start:kfc:android   # Launch KFC App on Android Device / Emulator
npm run start:kfc:ios       # Launch KFC App on iOS Simulator

# Halal Nando's UK App
npm run start:nandos:web    # Launch Nando's App in Web Browser (Responsive desktop view)
npm run start:nandos:android# Launch Nando's App on Android Device / Emulator
npm run start:nandos:ios    # Launch Nando's App on iOS Simulator
```

### Backend Microservices & Background Workers

```bash
# Fastify REST API (Port 3001)
npm run start:api           # Run REST API in production mode
npm run dev:api             # Run REST API with hot-reload watch

# BullMQ Background Worker (Repeatable 3 AM Sync)
npm run start:worker        # Run background scraping worker
npm run dev:worker          # Run worker with hot-reload watch

# Background Jobs Web View (Sidekiq Web Equivalent on Port 3000)
npm run start:jobs:ui       # Launch Bull-Board web dashboard (http://localhost:3000)
npm run dev:jobs:ui         # Launch Bull-Board web dashboard with hot-reload
# Note: Also embedded directly inside the REST API at http://localhost:3001/admin/queues

# Standalone Scrapers (Instant verification)
npm run scrape:kfc          # Scrape KFC UK directly (1,061 stores, 225 Halal)
npm run scrape:nandos       # Scrape Nando's UK directly (490 stores, 107 Halal)
```

### Code Quality & Database Operations

```bash
npm run typecheck           # Strict TypeScript validation across all workspaces
npm run lint                # ESLint check across all TypeScript modules
npm run lint:fix            # Auto-fix linting issues

npm run db:generate         # Generate Prisma 7 Client with LibSQL adapter
npm run db:push             # Push Prisma schema changes to dev.db
npm run db:studio           # Open Prisma Studio web GUI to browse database
```

### Docker Container Stack

Run the full local/production containerized ecosystem:

```bash
npm run docker:up           # Start Redis (6379), Bull-Board (3000), API (3001), and Worker
npm run docker:logs         # Stream live container logs
npm run docker:down         # Stop containers
```

- **Bull-Board Dashboard**: [http://localhost:3000](http://localhost:3000) (Monitor active, completed, and failed sync jobs, identical to Sidekiq Web)
- **REST API Endpoints**: [http://localhost:3001](http://localhost:3001)

---

## 3. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Healthcheck and uptime |
| `GET` | `/api/v1/stats` | Live store statistics, Halal counts, and scrape audit logs |
| `GET` | `/api/v1/chains` | Metadata for all registered chains (brand colors, supported filters) |
| `GET` | `/api/v1/restaurants` | Multi-filter search (`q`, `halal=true`, `chain=kfc`, `driveThru=true`, etc.) |
| `GET` | `/api/v1/restaurants/nearby` | Proximity search by GPS (`lat=51.5&lng=-0.1&radius=5`) sorted nearest first |
| `GET` | `/api/v1/restaurants/:chain/:id` | Detailed store lookup (facilities, opening hours, channels) |

Example Nearby Query:
```bash
curl "http://localhost:3001/api/v1/restaurants/nearby?lat=51.5074&lng=-0.1278&halal=true&radius=3&limit=5"
```

---

## 4. Scalability Architecture: Adding a New Restaurant Chain

The monorepo uses a **Pluggable Chain Adapter Pattern** so adding a new restaurant chain (e.g., McDonald's, Subway, Wingstop) does not require modifying core search or API routes:

1. **Define Chain Types** in `libs/types/src/chains/<chain>.ts`:
   - Create the chain-specific input schema with **Zod**.
2. **Add Scraper** in `libs/scrapers/src/<chain>.ts`:
   - Implement the reverse-engineered store locator parser.
3. **Create Database Table & Adapter** in `libs/database/src/chains/<chain>.ts`:
   - Add model to `libs/database/prisma/schema.prisma`.
   - Implement the `RestaurantChainAdapter` interface (`search`, `getById`, `getStats`, `upsert`).
   - Register it with `chainRegistry.register(myNewAdapter)`.
4. **Create Background Sync Handler** in `libs/jobs/src/chains/<chain>.ts`:
   - Register it with `jobChainRegistry.register('<CHAIN>', syncMyChain)`.
5. **Create Mobile App (optional)** in `apps/mobile-<chain>/`:
   - Connect to `@halal-restaurants/ui` using brand theme tokens.

---

## 5. Prisma 7 & SQLite Architecture

This project is built on **Prisma 7** using:
- **`prisma.config.ts`**: Centralized configuration handling schema paths and datasource URLs using `defineConfig`.
- **`@prisma/adapter-libsql`**: Native driver adapter connecting directly to `dev.db` with zero binary engine dependencies.
- **Table-per-chain schema**: `KfcRestaurant` and `NandosRestaurant` models maintain complete column fidelity for chain-specific attributes.
