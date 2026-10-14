export * from './schemas';

export type RestaurantChain = 'KFC' | 'NANDOS';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface UnifiedRestaurant {
  id: string;
  chain: RestaurantChain;
  chainId: string;
  name: string;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  telephone?: string | null;
  isHalal: boolean;
  amenities: {
    isHalal: boolean;
    hasDriveThru?: boolean;
    hasOutdoorSeating?: boolean;
    hasWifi?: boolean;
    hasDisabilityAccess?: boolean;
    hasBabyChanging?: boolean;
    isVeganFriendly?: boolean;
    hasDelivery?: boolean;
    hasCollection?: boolean;
    rawList: string[];
  };
  openingHours: any[];
  orderModes?: any;
  detailUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ScrapeSummary {
  chain: RestaurantChain;
  totalFound: number;
  halalFound: number;
  durationMs: number;
}
