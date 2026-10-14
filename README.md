# UK Halal Restaurants

An ultra-simple, offline-first mobile & web suite for **Halal KFC UK** and **Halal Nando's UK** built with **Expo**, **React Native**, **TanStack Query**, and **Zod**.

---

## 1. Radical Simplicity: Zero-Server, Offline-First Architecture

There is **no backend server**, **no background queue worker**, and **no database** required:

- **Bundled Offline Datasets**: The applications ship with pre-validated offline datasets (`kfc-offline-data.json`, `nandos-offline-data.json`) containing all **1,061 UK KFC branches** (225 certified Halal) and **490 UK Nando's branches** (107 certified Halal).
- **Instant First Launch (0ms)**: Opening the app immediately renders the complete store list from the bundled JSON dataset without any network latency or blank screen.
- **Client-Side Live Sync**: When connected to the internet, **TanStack Query** automatically fetches fresh store data directly from the official endpoints (KFC direct API & Nando's streaming payload), validates the data with **Zod**, and updates the app cache seamlessly.
- **Pull-To-Refresh**: Users can pull down the store list anytime to check for real-time updates.

```text
halal-restaurants/
├── apps/
│   ├── mobile-kfc/               # React Native / Expo app for Halal KFC UK (Web + Android + iOS)
│   │   ├── assets/               # Bundled kfc-offline-data.json (1,061 stores)
│   │   └── App.tsx               # TanStack Query + Live Fetcher + Memoized Virtualized List
│   │
│   └── mobile-nandos/            # React Native / Expo app for Halal Nando's UK (Web + Android + iOS)
│       ├── assets/               # Bundled nandos-offline-data.json (490 stores)
│       └── App.tsx               # TanStack Query + Live Fetcher + Memoized Virtualized List
│
├── libs/
│   ├── ui/                       # Shared UI library (HalalBadge, AmenityChip, RestaurantCard, Theme tokens)
│   ├── scrapers/                 # Direct client fetchers, parsers, offline data sync & sample fixtures
│   └── types/                    # Shared TypeScript interfaces & Zod validation schemas
│
├── package.json                  # Clean, lightweight scripts
├── tsconfig.json                 # Root TypeScript project config
└── tsconfig.base.json            # Base compiler configuration & path mappings
```

---

## 2. Available Scripts

### Run Applications

```bash
# Halal KFC UK App
npm run start:kfc:web          # Open KFC in Web Browser (Responsive desktop view)
npm run start:kfc:android      # Run KFC on Android Device / Emulator
npm run start:kfc:ios          # Run KFC on iOS Simulator
npm run start:kfc              # Interactive Expo QR code for Expo Go on physical phones

# Halal Nando's UK App
npm run start:nandos:web       # Open Nando's in Web Browser (Responsive desktop view)
npm run start:nandos:android   # Run Nando's on Android Device / Emulator
npm run start:nandos:ios       # Run Nando's on iOS Simulator
npm run start:nandos           # Interactive Expo QR code for Expo Go on physical phones
```

### Data Sync & Code Quality

```bash
# Refresh bundled offline JSON datasets directly from source
npm run sync:data

# Code verification
npm run typecheck              # Strict TypeScript compiler verification
npm run lint                   # ESLint check
npm run lint:fix               # ESLint auto-fix
```

---

## 3. Testing with Playwright

Run web mode and inspect interactive filtering, searching, and responsiveness using Playwright:

```bash
npm run start:kfc:web
```
Navigate to `http://localhost:8081` to test Halal filters, drive-thru filters, and town/postcode search.
