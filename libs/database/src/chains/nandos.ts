import { prisma, calculateDistanceMiles } from '../index';
import type { MobileRestaurantItem, RestaurantQuery, NandosRestaurantInput } from '@halal-restaurants/types';
import type { RestaurantChainAdapter, ChainStats } from './types';

export function extractNandosAmenities(branch: {
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

export class NandosChainAdapter implements RestaurantChainAdapter {
  readonly chainId = 'nandos';
  readonly displayName = "Nando's UK";
  readonly brandColor = '#BA1B1D';
  readonly accentColor = '#F5B041';
  readonly description = "Official UK Nando's restaurants with certified Halal filtering";
  readonly supportedFilters = ['halal', 'outdoorSeating', 'wifi', 'babyChanging', 'disabledAccess'];

  async search(query: RestaurantQuery): Promise<MobileRestaurantItem[]> {
    const { halal, q, lat, lng, radius = 10, outdoorSeating } = query;

    const where: any = {};
    if (halal !== undefined) where.isHalal = halal;
    if (outdoorSeating !== undefined) where.hasOutdoorSeating = outdoorSeating;

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { name: { contains: term } },
        { city: { contains: term } },
        { postalCode: { contains: term } },
        { street: { contains: term } }
      ];
    }

    const stores = await prisma.nandosRestaurant.findMany({ where });
    const items: MobileRestaurantItem[] = [];

    for (const store of stores) {
      let distanceMiles: number | null = null;
      if (lat !== undefined && lng !== undefined && store.latitude && store.longitude) {
        distanceMiles = calculateDistanceMiles(lat, lng, store.latitude, store.longitude);
        if (distanceMiles > radius) continue;
      }

      items.push({
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

    return items;
  }

  async getById(id: string): Promise<any | null> {
    const cleanId = id.replace(/^nandos-/, '');
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

  async getStats(): Promise<ChainStats> {
    const [total, halal, outdoorSeating] = await Promise.all([
      prisma.nandosRestaurant.count(),
      prisma.nandosRestaurant.count({ where: { isHalal: true } }),
      prisma.nandosRestaurant.count({ where: { hasOutdoorSeating: true } })
    ]);

    return {
      total,
      halal,
      nonHalal: total - halal,
      halalPercentage: total > 0 ? Math.round((halal / total) * 1000) / 10 : 0,
      outdoorSeating
    };
  }

  async upsert(data: NandosRestaurantInput) {
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
}

export const nandosAdapter = new NandosChainAdapter();

