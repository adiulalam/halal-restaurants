import { prisma, calculateDistanceMiles } from '../index';
import type { MobileRestaurantItem, RestaurantQuery, KfcRestaurantInput } from '@halal-restaurants/types';
import type { RestaurantChainAdapter, ChainStats } from './types';

export function extractKfcAmenities(store: {
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

export class KfcChainAdapter implements RestaurantChainAdapter {
  readonly chainId = 'kfc';
  readonly displayName = 'KFC UK';
  readonly brandColor = '#E4002B';
  readonly accentColor = '#1C1917';
  readonly description = 'Official UK KFC restaurants with certified Halal filtering';
  readonly supportedFilters = ['halal', 'driveThru', 'wifi', 'babyChanging', 'disabilityAccess'];

  async search(query: RestaurantQuery): Promise<MobileRestaurantItem[]> {
    const { halal, q, lat, lng, radius = 10, driveThru } = query;

    const where: any = {};
    if (halal !== undefined) where.isHalal = halal;
    if (driveThru !== undefined) where.hasDriveThru = driveThru;

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { city: { contains: term } },
        { postalCode: { contains: term } },
        { street: { contains: term } }
      ];
    }

    const stores = await prisma.kfcRestaurant.findMany({ where });
    const items: MobileRestaurantItem[] = [];

    for (const store of stores) {
      let distanceMiles: number | null = null;
      if (lat !== undefined && lng !== undefined && store.latitude && store.longitude) {
        distanceMiles = calculateDistanceMiles(lat, lng, store.latitude, store.longitude);
        if (distanceMiles > radius) continue;
      }

      items.push({
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

    return items;
  }

  async getById(id: string): Promise<any | null> {
    const cleanId = id.replace(/^kfc-/, '');
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

  async getStats(): Promise<ChainStats> {
    const [total, halal, driveThru] = await Promise.all([
      prisma.kfcRestaurant.count(),
      prisma.kfcRestaurant.count({ where: { isHalal: true } }),
      prisma.kfcRestaurant.count({ where: { hasDriveThru: true } })
    ]);

    return {
      total,
      halal,
      nonHalal: total - halal,
      halalPercentage: total > 0 ? Math.round((halal / total) * 1000) / 10 : 0,
      driveThru
    };
  }

  async upsert(data: KfcRestaurantInput) {
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
}

export const kfcAdapter = new KfcChainAdapter();
