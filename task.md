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
- [ ] **2.1 Initialize Nx Workspace**
  - Scaffold Nx monorepo with modern package manager (`pnpm` or `npm`).
  - Configure root TypeScript (`tsconfig.base.json`), ESLint, and Prettier.
- [ ] **2.2 Local Container Infrastructure**
  - Create `docker/docker-compose.yml` with:
    - `redis:alpine` (BullMQ broker)
    - `postgis/postgis:16-3.4-alpine` (spatial database)
    - Bull-Board queue monitor
  - Verify container orchestration and health checks.
- [ ] **2.3 Database Setup (`libs/database`)**
  - Initialize ORM (Prisma or Drizzle) with PostGIS extension.
  - Define schema: `Chain`, `Restaurant`, `Amenity`, `ScrapeRun`, `ScrapeLog`.
  - Add spatial indexing for coordinates (`ST_Point(lng, lat)`).

---

### Phase 3: Background Job Engine & Scrapers (`libs/jobs`, `libs/scrapers`, `apps/worker`)
- [ ] **3.1 Scraper Implementations (`libs/scrapers`)**
  - Implement `KfcUkScraper` with automated pagination, bounding-box traversal, and Halal flag extraction.
  - Implement `NandosUkScraper` with full UK store collection and Halal status cross-referencing.
  - Add fallback stealth mechanisms (Playwright headless) if static API calls encounter WAF challenges.
  - Write unit tests with mocked API fixtures.
- [ ] **3.2 Queue & Worker Architecture (`libs/jobs`)**
  - Configure BullMQ connection and typed job contracts:
    - `SYNC_KFC_STORES`
    - `SYNC_NANDOS_STORES`
    - `ENRICH_STORE_METADATA` (categorize halal, pet-friendly, etc.)
  - Implement worker processors with exponential backoff and error alerting.
  - Add cron repeatable triggers (e.g., sync once every 24/48 hours).
- [ ] **3.3 Worker Application (`apps/worker`) & Bull-Board (`apps/bull-board-ui`)**
  - Create lightweight Node.js executable for the worker.
  - Wire up Bull-Board to expose job metrics, completed/failed tasks, and manual "Trigger Sync" actions.

---

### Phase 4: Shared Mobile UI Design System (`libs/ui`)
- [ ] **4.1 Design System Infrastructure**
  - Setup React Native / NativeWind (Tailwind CSS) component library.
  - Build multi-brand Theme Engine:
    - **KFC Brand Theme**: Red, Black, White palette, Colonel iconography.
    - **Nando's Brand Theme**: Peri-Peri warm tones, Rooster green/yellow palette.
- [ ] **4.2 Core Components**
  - `RestaurantCard`: Shows name, distance, halal indicator, opening hours, amenity chips.
  - `HalalBadge`: Distinct visual indicator (HMC certified, Halal poultry only, etc.).
  - `AmenityFilterBar`: Quick toggles for Halal, Pet Friendly, Drive-thru, Outdoor Seating.
  - `StoreMapView`: Map with custom brand markers, clustering, and callouts.
  - `SearchBar`: Postcode and UK town autocomplete search.

---

### Phase 5: Mobile Applications (`apps/mobile-kfc` & `apps/mobile-nandos`)
- [ ] **5.1 App Scaffolding**
  - Initialize Expo / React Native project for `apps/mobile-kfc`.
  - Initialize Expo / React Native project for `apps/mobile-nandos`.
- [ ] **5.2 Feature Implementation**
  - **Nearby Screen**: User geolocation, list & map view of nearest restaurants.
  - **Filter Screen**: Filter by Halal status, pet friendly, drive-thru, open now.
  - **Details Screen**: Address, phone, opening times, halal certificate details, directions action (Apple Maps / Google Maps).
  - **Offline Caching**: Local caching of favorite stores using AsyncStorage or MMKV.

---

### Phase 6: API Service & Production Deployment
- [ ] **6.1 Mobile Backend API (`apps/api`)**
  - Build fast spatial query endpoints:
    - `GET /api/v1/restaurants/nearby?chain=kfc&lat=...&lng=...&halal=true&petFriendly=true`
    - `GET /api/v1/restaurants/:id`
    - `GET /api/v1/restaurants/search?q=London`
- [ ] **6.2 Dockerization & Deployment**
  - Multi-stage Dockerfiles for `apps/api` and `apps/worker`.
  - Production deployment configuration (Render / Railway / VPS / AWS ECS).
  - Setup EAS (Expo Application Services) build config for iOS & Android app binaries.

---

## 5. Next Immediate Step
Begin with **Phase 2: Monorepo Foundation with Nx**:
1. Scaffold the Nx monorepo workspace in `c:\Homespace\halal-restaurants`.
2. Configure Docker Compose for Redis (BullMQ queue broker) + PostgreSQL/PostGIS.
3. Setup shared database and domain type packages (`libs/types` and `libs/database`).

