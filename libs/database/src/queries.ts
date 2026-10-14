import { prisma } from './index';
import type {
  MobileRestaurantItem,
  RestaurantQuery,
  NearbyQuery
} from '@halal-restaurants/types';
import { chainRegistry, kfcAdapter, nandosAdapter } from './chains/registry';

/**
 * Universal Restaurant Search with Geo-Sorting and Multi-Filtering
 * Delegates querying to registered per-chain adapters dynamically
 */
export async function searchRestaurants(query: RestaurantQuery) {
  const {
    chain = 'all',
    lat,
    lng,
    limit = 50,
    offset = 0
  } = query;

  // 1. Resolve which adapters to query
  const targetAdapters =
    chain === 'all'
      ? chainRegistry.getAll()
      : [chainRegistry.get(chain)].filter(Boolean);

  // 2. Query adapters concurrently
  const searchPromises = targetAdapters.map((adapter) =>
    adapter ? adapter.search(query) : Promise.resolve([])
  );
  const searchResults = await Promise.all(searchPromises);
  const results: MobileRestaurantItem[] = searchResults.flat();

  // 3. Sort results
  if (lat !== undefined && lng !== undefined) {
    // Sort primarily by distance if coordinates provided
    results.sort((a, b) => {
      const distA = a.distanceMiles ?? 999999;
      const distB = b.distanceMiles ?? 999999;
      return distA - distB;
    });
  } else {
    // Sort alphabetically by name
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = results.length;
  const paginated = results.slice(offset, offset + limit);

  return {
    total,
    count: paginated.length,
    offset,
    limit,
    items: paginated
  };
}

/**
 * Dedicated Nearby Search with Geolocation Coordinates
 */
export async function findNearbyRestaurants(query: NearbyQuery) {
  return searchRestaurants({
    chain: query.chain,
    lat: query.lat,
    lng: query.lng,
    radius: query.radius,
    halal: query.halal,
    limit: query.limit,
    offset: 0
  });
}

/**
 * Lookup restaurant by chain identifier and store ID
 */
export async function getRestaurantByChainAndId(chain: string, id: string) {
  const adapter = chainRegistry.get(chain);
  if (!adapter) return null;
  return adapter.getById(id);
}

/**
 * Single KFC restaurant lookup (backward-compatible delegate)
 */
export async function getKfcRestaurantById(storeId: string) {
  return kfcAdapter.getById(storeId);
}

/**
 * Single Nando's restaurant lookup (backward-compatible delegate)
 */
export async function getNandosRestaurantById(branchCode: string) {
  return nandosAdapter.getById(branchCode);
}

/**
 * Database & Scraper Statistics across all registered chains
 */
export async function getDatabaseStats() {
  const adapters = chainRegistry.getAll();

  const [statsList, recentAudits] = await Promise.all([
    Promise.all(
      adapters.map(async (adapter) => {
        const stats = await adapter.getStats();
        return { chainId: adapter.chainId, stats };
      })
    ),
    prisma.scrapeAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  const chains: Record<string, any> = {};
  let totalRestaurants = 0;
  let totalHalal = 0;

  for (const { chainId, stats } of statsList) {
    chains[chainId] = stats;
    totalRestaurants += stats.total;
    totalHalal += stats.halal;
  }

  return {
    chains,
    totals: {
      restaurants: totalRestaurants,
      halalRestaurants: totalHalal,
      overallHalalPercentage:
        totalRestaurants > 0
          ? Math.round((totalHalal / totalRestaurants) * 1000) / 10
          : 0
    },
    recentScrapes: recentAudits
  };
}
