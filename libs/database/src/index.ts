import path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import type { KfcRestaurantInput, NandosRestaurantInput, RestaurantChain } from '@halal-restaurants/types';
import { kfcAdapter } from './chains/kfc';
import { nandosAdapter } from './chains/nandos';

function createPrismaClient(): PrismaClient {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    const defaultDbPath = path.resolve(__dirname, '../prisma/dev.db');
    dbUrl = `file:${defaultDbPath}`;
  } else if (dbUrl.startsWith('file:') && !path.isAbsolute(dbUrl.replace(/^file:/, ''))) {
    const rawPath = dbUrl.replace(/^file:/, '');
    const absPath = path.resolve(process.cwd(), rawPath);
    dbUrl = `file:${absPath}`;
  }
  const adapter = new PrismaLibSql({ url: dbUrl });
  return new PrismaClient({ adapter });
}

// Global singleton instance for PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export * from './chains/registry';

/**
 * Upsert a KFC Restaurant into the database (delegates to kfcAdapter)
 */
export async function upsertKfcRestaurant(data: KfcRestaurantInput) {
  return kfcAdapter.upsert(data);
}

/**
 * Upsert a Nando's Restaurant into the database (delegates to nandosAdapter)
 */
export async function upsertNandosRestaurant(data: NandosRestaurantInput) {
  return nandosAdapter.upsert(data);
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
