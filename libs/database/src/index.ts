import { PrismaClient } from '@prisma/client';
import type { KfcRestaurantInput, NandosRestaurantInput, RestaurantChain } from '@halal-restaurants/types';

// Global singleton instance for PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';

/**
 * Upsert a KFC Restaurant into the database
 */
export async function upsertKfcRestaurant(data: KfcRestaurantInput) {
  return prisma.kfcRestaurant.upsert({
    where: { storeId: data.storeId },
    create: {
      storeId: data.storeId,
      refId: data.refId,
      name: data.name,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country || 'GB',
      latitude: data.latitude,
      longitude: data.longitude,
      region: data.region,
      isHalal: data.isHalal,
      hasDriveThru: data.hasDriveThru,
      hasWifi: data.hasWifi,
      hasDisabilityAccess: data.hasDisabilityAccess,
      hasBabyChanging: data.hasBabyChanging,
      isVeganFriendly: data.isVeganFriendly,
      judoPayId: data.judoPayId,
      status: data.status,
      bagTaxType: data.bagTaxType,
      defaultEtaMin: data.defaultEtaMin,
      defaultEtaMax: data.defaultEtaMax,
      facilitiesJson: data.facilitiesJson,
      orderModesJson: data.orderModesJson,
      openingHoursJson: data.openingHoursJson,
      detailUrl: data.detailUrl
    },
    update: {
      name: data.name,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      region: data.region,
      isHalal: data.isHalal,
      hasDriveThru: data.hasDriveThru,
      hasWifi: data.hasWifi,
      hasDisabilityAccess: data.hasDisabilityAccess,
      hasBabyChanging: data.hasBabyChanging,
      isVeganFriendly: data.isVeganFriendly,
      status: data.status,
      facilitiesJson: data.facilitiesJson,
      orderModesJson: data.orderModesJson,
      openingHoursJson: data.openingHoursJson,
      detailUrl: data.detailUrl
    }
  });
}

/**
 * Upsert a Nando's Restaurant into the database
 */
export async function upsertNandosRestaurant(data: NandosRestaurantInput) {
  return prisma.nandosRestaurant.upsert({
    where: { branchCode: data.branchCode },
    create: {
      branchCode: data.branchCode,
      name: data.name,
      slug: data.slug,
      seoSlug: data.seoSlug,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country || 'GB',
      latitude: data.latitude,
      longitude: data.longitude,
      region: data.region,
      telephone: data.telephone,
      isHalal: data.isHalal,
      hasOutdoorSeating: data.hasOutdoorSeating,
      hasBabyChanging: data.hasBabyChanging,
      hasDisabledAccess: data.hasDisabledAccess,
      hasWifi: data.hasWifi,
      hasDelivery: data.hasDelivery,
      hasCollection: data.hasCollection,
      status: data.status,
      mapCID: data.mapCID,
      amenitiesJson: data.amenitiesJson,
      orderChannelsJson: data.orderChannelsJson,
      openingHoursJson: data.openingHoursJson,
      detailUrl: data.detailUrl
    },
    update: {
      name: data.name,
      slug: data.slug,
      seoSlug: data.seoSlug,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      region: data.region,
      telephone: data.telephone,
      isHalal: data.isHalal,
      hasOutdoorSeating: data.hasOutdoorSeating,
      hasBabyChanging: data.hasBabyChanging,
      hasDisabledAccess: data.hasDisabledAccess,
      hasWifi: data.hasWifi,
      hasDelivery: data.hasDelivery,
      hasCollection: data.hasCollection,
      status: data.status,
      amenitiesJson: data.amenitiesJson,
      orderChannelsJson: data.orderChannelsJson,
      openingHoursJson: data.openingHoursJson,
      detailUrl: data.detailUrl
    }
  });
}

/**
 * Log a scrape job run
 */
export async function logScrapeAudit(
  chain: RestaurantChain,
  totalScraped: number,
  halalCount: number,
  durationMs: number,
  status: 'SUCCESS' | 'FAILED' = 'SUCCESS',
  errorMessage?: string
) {
  return prisma.scrapeAuditLog.create({
    data: {
      chain,
      totalScraped,
      halalCount,
      durationMs,
      status,
      errorMessage
    }
  });
}

/**
 * Haversine formula calculation for distance in miles
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // Radius of the Earth in miles

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export * from './queries';

