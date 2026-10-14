import { prisma, calculateDistanceMiles } from './index';
import type {
  MobileRestaurantItem,
  RestaurantQuery,
  NearbyQuery
} from '@halal-restaurants/types';

/**
 * Format KFC raw amenities list
 */
function extractKfcAmenities(store: {
  isHalal: boolean;
  hasDriveThru: boolean;
  hasWifi: boolean;
  hasDisabilityAccess: boolean;
  hasBabyChanging: boolean;
  isVeganFriendly: boolean;
  facilitiesJson?: string | null;
}): string[] {
  const list: string[] = [];
  if (store.isHalal) list.push('100% Halal Certified');
  if (store.hasDriveThru) list.push('Drive Thru');
  if (store.hasWifi) list.push('Free Wifi');
  if (store.hasDisabilityAccess) list.push('Disability Access');
  if (store.hasBabyChanging) list.push('Baby Changing');
  if (store.isVeganFriendly) list.push('Vegan Friendly');

  if (store.facilitiesJson) {
    try {
      const parsed = JSON.parse(store.facilitiesJson);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const name = typeof item === 'string' ? item : item?.name;
          if (name && !list.includes(name) && !name.toLowerCase().includes('halal')) {
            list.push(name);
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return list;
}

/**
 * Format Nando's raw amenities list
 */
function extractNandosAmenities(branch: {
  isHalal: boolean;
  hasOutdoorSeating: boolean;
  hasBabyChanging: boolean;
  hasDisabledAccess: boolean;
  hasWifi: boolean;
  hasDelivery: boolean;
  hasCollection: boolean;
  amenitiesJson?: string | null;
}): string[] {
  const list: string[] = [];
  if (branch.isHalal) list.push('Halal Certified');
  if (branch.hasOutdoorSeating) list.push('Outdoor Seating');
  if (branch.hasDisabledAccess) list.push('Disabled Access');
  if (branch.hasBabyChanging) list.push('Baby Changing');
  if (branch.hasWifi) list.push('Wifi');
  if (branch.hasDelivery) list.push('Delivery');
  if (branch.hasCollection) list.push('Collection');

  if (branch.amenitiesJson) {
    try {
      const parsed = JSON.parse(branch.amenitiesJson);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const str = typeof item === 'string' ? item : item?.name;
          if (str && !str.includes('HALAL')) {
            const formatted = str
              .toLowerCase()
              .split('_')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');
            if (!list.includes(formatted)) {
              list.push(formatted);
            }
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return list;
}

/**
 * Comprehensive Restaurant Search with Geo-Sorting and Multi-Filters
 */
export async function searchRestaurants(query: RestaurantQuery) {
  const {
    chain = 'all',
    halal,
    q,
    lat,
    lng,
    radius = 10,
    driveThru,
    outdoorSeating,
    limit = 50,
    offset = 0
  } = query;

  const results: MobileRestaurantItem[] = [];

  // 1. Fetch KFC if applicable
  if (chain === 'all' || chain === 'kfc') {
    const kfcWhere: any = {};
    if (halal !== undefined) kfcWhere.isHalal = halal;
    if (driveThru !== undefined) kfcWhere.hasDriveThru = driveThru;

    if (q && q.trim()) {
      const term = q.trim();
      kfcWhere.OR = [
        { name: { contains: term } },
        { city: { contains: term } },
        { postalCode: { contains: term } },
        { street: { contains: term } }
      ];
    }

    const kfcStores = await prisma.kfcRestaurant.findMany({
      where: kfcWhere
    });

    for (const store of kfcStores) {
      let distanceMiles: number | null = null;
      if (lat !== undefined && lng !== undefined && store.latitude && store.longitude) {
        distanceMiles = calculateDistanceMiles(lat, lng, store.latitude, store.longitude);
        if (distanceMiles > radius) continue; // Out of radius
      }

      results.push({
        id: `kfc-${store.storeId}`,
        name: store.name,
        street: store.street,
        city: store.city,
        postalCode: store.postalCode,
        latitude: store.latitude,
        longitude: store.longitude,
        distanceMiles,
        isHalal: store.isHalal,
        amenitiesList: extractKfcAmenities(store),
        status: store.status,
        detailUrl: store.detailUrl
      });
    }
  }

  // 2. Fetch Nando's if applicable
  if (chain === 'all' || chain === 'nandos') {
    const nandosWhere: any = {};
    if (halal !== undefined) nandosWhere.isHalal = halal;
    if (outdoorSeating !== undefined) nandosWhere.hasOutdoorSeating = outdoorSeating;

    if (q && q.trim()) {
      const term = q.trim();
      nandosWhere.OR = [
        { name: { contains: term } },
        { city: { contains: term } },
        { postalCode: { contains: term } },
        { street: { contains: term } }
      ];
    }

    const nandosStores = await prisma.nandosRestaurant.findMany({
      where: nandosWhere
    });

    for (const store of nandosStores) {
      let distanceMiles: number | null = null;
      if (lat !== undefined && lng !== undefined && store.latitude && store.longitude) {
        distanceMiles = calculateDistanceMiles(lat, lng, store.latitude, store.longitude);
        if (distanceMiles > radius) continue; // Out of radius
      }

      results.push({
        id: `nandos-${store.branchCode}`,
        name: store.name,
        street: store.street,
        city: store.city,
        postalCode: store.postalCode,
        latitude: store.latitude,
        longitude: store.longitude,
        distanceMiles,
        isHalal: store.isHalal,
        amenitiesList: extractNandosAmenities(store),
        status: store.status,
        detailUrl: store.detailUrl,
        telephone: store.telephone
      });
    }
  }

  // 3. Sort results
  if (lat !== undefined && lng !== undefined) {
    // Sort primarily by distance
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
 * Get detailed KFC Restaurant by Store ID
 */
export async function getKfcRestaurantById(storeId: string) {
  const cleanId = storeId.replace(/^kfc-/, '');
  const store = await prisma.kfcRestaurant.findUnique({
    where: { storeId: cleanId }
  });

  if (!store) return null;

  return {
    ...store,
    chain: 'KFC',
    amenitiesList: extractKfcAmenities(store),
    facilities: store.facilitiesJson ? JSON.parse(store.facilitiesJson) : [],
    orderModes: store.orderModesJson ? JSON.parse(store.orderModesJson) : [],
    openingHours: store.openingHoursJson ? JSON.parse(store.openingHoursJson) : []
  };
}

/**
 * Get detailed Nando's Restaurant by Branch Code
 */
export async function getNandosRestaurantById(branchCode: string) {
  const cleanId = branchCode.replace(/^nandos-/, '');
  const store = await prisma.nandosRestaurant.findUnique({
    where: { branchCode: cleanId }
  });

  if (!store) return null;

  return {
    ...store,
    chain: 'NANDOS',
    amenitiesList: extractNandosAmenities(store),
    amenities: store.amenitiesJson ? JSON.parse(store.amenitiesJson) : [],
    orderChannels: store.orderChannelsJson ? JSON.parse(store.orderChannelsJson) : [],
    openingHours: store.openingHoursJson ? JSON.parse(store.openingHoursJson) : []
  };
}

/**
 * Database & Scraper Statistics
 */
export async function getDatabaseStats() {
  const [
    kfcTotal,
    kfcHalal,
    kfcDriveThru,
    nandosTotal,
    nandosHalal,
    nandosOutdoor,
    recentAudits
  ] = await Promise.all([
    prisma.kfcRestaurant.count(),
    prisma.kfcRestaurant.count({ where: { isHalal: true } }),
    prisma.kfcRestaurant.count({ where: { hasDriveThru: true } }),
    prisma.nandosRestaurant.count(),
    prisma.nandosRestaurant.count({ where: { isHalal: true } }),
    prisma.nandosRestaurant.count({ where: { hasOutdoorSeating: true } }),
    prisma.scrapeAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return {
    chains: {
      kfc: {
        total: kfcTotal,
        halal: kfcHalal,
        nonHalal: kfcTotal - kfcHalal,
        halalPercentage: kfcTotal > 0 ? Math.round((kfcHalal / kfcTotal) * 1000) / 10 : 0,
        driveThru: kfcDriveThru
      },
      nandos: {
        total: nandosTotal,
        halal: nandosHalal,
        nonHalal: nandosTotal - nandosHalal,
        halalPercentage: nandosTotal > 0 ? Math.round((nandosHalal / nandosTotal) * 1000) / 10 : 0,
        outdoorSeating: nandosOutdoor
      }
    },
    totals: {
      restaurants: kfcTotal + nandosTotal,
      halalRestaurants: kfcHalal + nandosHalal,
      overallHalalPercentage:
        kfcTotal + nandosTotal > 0
          ? Math.round(((kfcHalal + nandosHalal) / (kfcTotal + nandosTotal)) * 1000) / 10
          : 0
    },
    recentScrapes: recentAudits
  };
}
