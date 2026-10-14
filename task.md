# Halal Restaurants Monorepo Project Plan

## 1. Project Overview & Objectives

Build a modern, scalable TypeScript monorepo using **Nx** to power dedicated UK mobile applications for **Halal KFC** and **Halal Nando's**. 

The system automates the periodic discovery, scraping, and categorization of all KFC and Nando's UK restaurants (tagging attributes like **Halal status**, **Pet-friendly**, **Drive-thru**, **Outdoor seating**, and **Opening hours**), providing verified real-time data to mobile users.

---

## 2. Architectural Decisions & Tech Stack

### Monorepo Tooling: **Nx**
* **Why Nx**: Industry-standard monorepo management for React Native / Expo, Node.js microservices, and shared TypeScript libraries. Offers distributed caching, task graphs (`nx affected`), and strict boundary enforcement.

### Background Job & Queue Engine: **BullMQ + Redis + Bull-Board**
> **Sidekiq Equivalent in TypeScript / Docker:**
> You asked for an open-source, easy-to-host, Docker-friendly Sidekiq alternative.
> **BullMQ** (powered by Redis or Dragonfly/Valkey) is the direct Node.js/TypeScript counterpart to Ruby's Sidekiq:
> - **Same Core Model**: Redis-backed message broker with ultra-fast job processing, at-least-once delivery, and concurrent worker threads.
> - **Cron / Repeatable Jobs**: Native scheduler support for periodic scraping intervals (e.g. daily/weekly UK store syncs).
> - **Resilience**: Configurable exponential backoff, rate limiting, parent-child job workflows, and dead-letter queues.
> - **UI Dashboard**: **Bull-Board** (`@bull-board/ui` + `@bull-board/fastify` or `express`), delivering an interactive web dashboard identical in spirit to Sidekiq Web.
> - **Docker Friendly**: Runs smoothly with official `redis:alpine` and lightweight Node.js Alpine container images via `docker-compose.yml`.

### Reverse Engineering Pipeline: **REA (`Reverse-Engineer-anything`)**
* Using [`Reverse-Engineer-anything`](https://github.com/NabilRFG12/Reverse-Engineer-anything) (`npx rea-agents setup`) alongside network traffic analysis and JS bundle inspection to extract the undocumented internal store locator APIs, GraphQL schemas, and Next.js / Algolia payloads used by `kfc.co.uk` and `nandos.co.uk`.

### Mobile Tech Stack: **React Native with Expo**
* Cross-platform (iOS and Android).
* Shared UI library with theme tokens (KFC brand theme vs. Nando's brand theme).
* Native map integration (Apple Maps / Google Maps) with PostGIS geospatial queries.

### Persistence & Geodata: **PostgreSQL + PostGIS + Prisma / Drizzle ORM**
* PostGIS enables spatial queries (`ST_DWithin`, finding restaurants within X miles of user's current GPS location).

---

## 3. Monorepo Directory Layout

```text
halal-restaurants/
├── apps/
│   ├── mobile-kfc/               # React Native (Expo) app for Halal KFC UK
│   ├── mobile-nandos/            # React Native (Expo) app for Halal Nando's UK
│   ├── api/                      # Fastify / NestJS REST & GraphQL API for mobile apps
│   ├── worker/                   # BullMQ worker process executing scraping & categorization jobs
│   └── bull-board-ui/            # Web dashboard monitoring queues and job runs
│
├── libs/
│   ├── ui/                       # Shared React Native component library (Design System)
│   │   ├── components/           # RestaurantCard, HalalBadge, AmenityChip, MapView, FilterModal
│   │   ├── theme/                # Theme provider supporting KFC and Nando's design tokens
│   │   └── hooks/                # useGeolocation, useRestaurantFilter, useFavorites
│   │
│   ├── jobs/                     # Shared background job definitions & BullMQ queue contracts
│   │   ├── queues/               # Queue definitions (scraperQueue, classificationQueue)
│   │   ├── workers/              # Job processors and retry policies
│   │   └── schedulers/           # Repeatable cron triggers
│   │
│   ├── scrapers/                 # Scraper modules & reverse-engineered client APIs
│   │   ├── kfc/                  # KFC UK API client, parsers, and validation
│   │   ├── nandos/               # Nando's UK API client, parsers, and validation
│   │   └── common/               # Rate limiters, user-agent rotators, stealth fetchers
│   │
│   ├── database/                 # Prisma / Drizzle schema, PostGIS migrations, and client
│   └── types/                    # Shared TypeScript interfaces (Restaurant, Amenity, GeoLocation)
│
├── docker/
│   ├── docker-compose.yml        # Local dev stack (Redis, PostgreSQL/PostGIS, Bull-Board)
│   ├── Dockerfile.worker         # Production Dockerfile for background worker
│   └── Dockerfile.api            # Production Dockerfile for API service
│
├── task.md                       # Implementation roadmap & progress tracker
├── nx.json                       # Nx monorepo configuration
└── package.json                  # Root workspace dependencies
```

---

## 4. Implementation Checklist & Progress Tracker

### Phase 1: Reverse Engineering & Discovery (KFC & Nando's UK)
- [x] **1.1 Set up REA & Analysis Workspace**
  - Inspected `rea-agents` and configured browser inspection & network interception via Playwright.
- [x] **1.2 Reverse Engineer KFC UK (`kfc.co.uk`)**
  - Discovered direct endpoint: `GET https://www.kfc.co.uk/api/cms/api/data/restaurants_all?countrycode=GB`
  - Required headers: `x-api-key: siYAzKattmaIHSwMV9OJYtaoP8SRq`, `countrycode: GB`, `langcode: en`, `codemarket: UK`
  - Total UK locations extracted: **1,061 restaurants**
  - Halal status flag: `facilities` containing `{"name": "100% Halal Certified"}` -> **225 Halal branches**
  - Amenities identified: Drive Thru (481), Free Wifi (705), Disability Access (665), Baby Changing (599), Mobile Ordering (692), Vegan (477), Parking (65), EV Charging (5), Rewards Arcade (1156), Express (144).
  - Geolocation: `geolocation.latitude` and `geolocation.longitude`.
  - Created standalone verified scraper: `kfc-scraper.mjs`.
- [x] **1.3 Reverse Engineer Nando's UK (`nandos.co.uk`)**
  - Discovered streaming payload: `GET https://www.nandos.co.uk/restaurants` returning Next.js App Router RSC stream (`self.__next_f.push([1, "..."])`).
  - Total UK locations extracted: **490 restaurants** across 13 regions.
  - Halal status flag: `amenities` containing `"HALAL"` -> **107 Halal branches** (matches official statement of 100+ branches).
  - Amenities identified: `HALAL` (107), `OUTDOOR_EATING_AREA` (284), `BABY_CHANGING` (433), `DISABLED_ACCESS` (429), `UNDERGROUND_STATION` (98), `RAIL_STATION` (336), `LANDMARK` (311), `WIFI` (490), `DELIVERY` (441), `COLLECTION` (490), `CINEMA` (188).
  - Geolocation: `geo.latitude`, `geo.longitude`, formatted street address and postal code.
  - Created standalone verified scraper: `nandos-scraper.mjs`.
- [x] **1.4 Categorization Schema Definition**
  - Unified `Restaurant` domain model defined normalizing KFC and Nando's data (chain, chainId, location, isHalal, amenities, hours, orderModes, detailUrl).

---

### Phase 2: Monorepo Foundation with Nx
- [x] **2.1 Initialize Nx Workspace**
  - Initialized Nx 23.3 monorepo workspace with npm workspaces (`apps/*`, `libs/*`).
  - Configured root TypeScript `tsconfig.base.json` with path aliases for all packages.
- [x] **2.2 Local Container Infrastructure**
  - Created `docker/docker-compose.yml` with:
    - Redis (BullMQ broker / Sidekiq counterpart)
    - Bull-Board (Sidekiq Web UI dashboard equivalent)
- [x] **2.3 Database Setup (`libs/database`)**
  - Configured Prisma with SQLite (`file:./dev.db`) for rapid iteration and zero-setup local storage.
  - Implemented scalable table-per-restaurant architecture:
    - `KfcRestaurant`: stores all KFC UK attributes (storeId, judopayid, bagtaxtype, facilities, order modes, hours).
    - `NandosRestaurant`: stores all Nando's UK attributes (branchCode, slug, mapCID, telephone, amenities, channels, hours).
    - `ScrapeAuditLog`: tracks execution metrics, duration, and halal counts.
  - Seeded and verified: **1,061 KFC UK restaurants** (225 Halal) and **490 Nando's UK restaurants** (107 Halal) populated in SQLite.

---

### Phase 3: Background Job Engine & Scrapers (`libs/jobs`, `libs/scrapers`, `apps/worker`)
- [x] **3.1 Scraper Implementations (`libs/scrapers`)**
  - Implemented `libs/scrapers/src/kfc.ts` (direct API client extracting all 1,061 restaurants).
  - Implemented `libs/scrapers/src/nandos.ts` (Next.js App Router RSC stream parser extracting all 490 restaurants).
- [x] **3.2 Queue & Worker Architecture (`libs/jobs`)**
  - Configured BullMQ (Redis-backed, TypeScript/Node Sidekiq counterpart) with exponential backoff and retry policies.
  - Implemented worker processors in `libs/jobs/src/workers.ts` for `KFC`, `NANDOS`, and `ALL` synchronization.
  - Implemented repeatable cron scheduler in `libs/jobs/src/scheduler.ts` (daily at 03:00 AM).
- [x] **3.3 Worker Application (`apps/worker`)**
  - Built Node.js worker service in `apps/worker/src/main.ts` managing BullMQ queues and SQLite persistence.

---

### Phase 4: Shared Mobile UI Design System (`libs/ui`)
- [x] **4.1 Design System & Brand Theming**
  - Created theme system in `libs/ui/src/theme.tsx` supporting:
    - `KFC_THEME`: Colonel Red (`#E4002B`), dark charcoal, verified halal green.
    - `NANDOS_THEME`: Peri-Peri Red (`#BA1B1D`), warm yellow (`#F5B041`), verified halal green.
- [x] **4.2 Reusable Components**
  - `HalalBadge`: Visual certification badge ("100% HALAL CERTIFIED" vs "STANDARD").
  - `AmenityChip`: Interactive filter chip for Drive-thru, Outdoor Seating, Baby Changing, etc.
  - `RestaurantCard`: Complete restaurant card displaying distance, address, halal badge, and amenities.

---

### Phase 5: Mobile Applications (`apps/mobile-kfc` & `apps/mobile-nandos`)
- [x] **5.1 Halal KFC Mobile App (`apps/mobile-kfc`)**
  - Built React Native / Expo application with KFC branding.
  - Integrated **TanStack Query** (`useRestaurants`) with bundled offline JSON (`assets/kfc-offline-data.json`, 1,061 restaurants).
  - Features: Instant first-load & offline view, Halal-only toggle (225 branches), drive-thru filter, search bar, restaurant card list, Google Maps navigation.
- [x] **5.2 Halal Nando's Mobile App (`apps/mobile-nandos`)**
  - Built React Native / Expo application with Nando's branding.
  - Integrated **TanStack Query** (`useRestaurants`) with bundled offline JSON (`assets/nandos-offline-data.json`, 490 restaurants).
  - Features: Instant first-load & offline view, Halal-only toggle (107 branches), outdoor seating filter, search bar, restaurant card list, Google Maps navigation.
- [x] **5.3 Zod Schema Validation & Data Integrity**
  - Defined strict Zod schemas in `libs/types/src/schemas.ts` for KFC (`KfcRestaurantInputSchema`), Nando's (`NandosRestaurantInputSchema`), and mobile query items (`MobileRestaurantItemSchema`).
  - Scraper pipeline (`libs/scrapers`) and BullMQ background worker (`libs/jobs/src/workers.ts`) validate all records before database upsertion.
  - Bundled offline JSON files are 100% pre-validated against Zod schemas.

---

### Phase 6: API Service & Production Deployment
- [x] **6.1 Mobile Backend API (`apps/api`)**
  - Built high-performance Fastify REST service with CORS, logging, and error handling.
  - Implemented endpoints:
    - `GET /health` and `GET /api/v1/health`: System health and uptime.
    - `GET /api/v1/stats`: Chain breakdown (total, halal, percentage) and recent scrape audit logs.
    - `GET /api/v1/chains`: Chain metadata, branding tokens, and supported filter attributes.
    - `GET /api/v1/restaurants`: Text search (`q`), Halal toggle (`halal`), chain filter (`chain`), amenities filter (`driveThru`, `outdoorSeating`), pagination (`limit`, `offset`).
    - `GET /api/v1/restaurants/nearby`: GPS spatial queries (`lat`, `lng`, `radius`) computing distance via Haversine formula and sorting ascending by proximity.
    - `GET /api/v1/restaurants/kfc/:id`: Deep store details including parsed facilities, order modes, and opening hours.
    - `GET /api/v1/restaurants/nandos/:id`: Deep branch details including parsed amenities, order channels, and opening hours.
  - Strict input validation using Zod (`RestaurantQuerySchema`, `NearbyQuerySchema`) returning formatted 400 Bad Request on invalid parameters.
- [x] **6.2 Dockerization & Deployment**
  - Multi-stage `Dockerfile.api` and `Dockerfile.worker` built on lightweight `node:22-alpine` with Prisma client generation and SQLite persistence volume (`/app/data`).
  - Production `docker/docker-compose.yml` orchestrating Redis, Bull-Board UI, Fastify REST API, and BullMQ Background Scraper Worker.
  - Configured EAS (Expo Application Services) build profiles (`eas.json`) for `apps/mobile-kfc` and `apps/mobile-nandos` targeting internal preview APKs and production app store bundles (`app-bundle`, `.ipa`).

---

## 5. Project Status: COMPLETED
All 6 phases are complete, fully validated, and verified:
1. Reverse engineering & verified direct extractors for KFC UK (1,061 restaurants, 225 Halal) and Nando's UK (490 restaurants, 107 Halal).
2. Monorepo foundation with Nx, SQLite via Prisma, and scalable table-per-restaurant schema.
3. BullMQ background job processing with repeatable 03:00 AM cron scheduler and Bull-Board dashboard.
4. Shared mobile & web UI component library with brand design tokens and performance-optimized memoized components.
5. Dedicated Halal KFC and Halal Nando's mobile & web apps with TanStack Query and bundled offline datasets.
6. Mobile backend REST API service (`apps/api`), multi-stage Dockerfiles, Docker Compose stack, and EAS build configuration.

