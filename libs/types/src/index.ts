export type RestaurantChain = 'KFC' | 'NANDOS';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface UnifiedRestaurant {
  id: string;
  chain: RestaurantChain;
  chainId: string; // storeId for KFC, branchCode for Nando's
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

export interface KfcRestaurantInput {
  storeId: string;
  refId?: string | null;
  name: string;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  isHalal: boolean;
  hasDriveThru: boolean;
  hasWifi: boolean;
  hasDisabilityAccess: boolean;
  hasBabyChanging: boolean;
  isVeganFriendly: boolean;
  judoPayId?: string | null;
  status?: string | null;
  bagTaxType?: string | null;
  defaultEtaMin?: number | null;
  defaultEtaMax?: number | null;
  facilitiesJson?: string | null;
  orderModesJson?: string | null;
  openingHoursJson?: string | null;
  detailUrl?: string | null;
}

export interface NandosRestaurantInput {
  branchCode: string;
  name: string;
  slug?: string | null;
  seoSlug?: string | null;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  telephone?: string | null;
  isHalal: boolean;
  hasOutdoorSeating: boolean;
  hasBabyChanging: boolean;
  hasDisabledAccess: boolean;
  hasWifi: boolean;
  hasDelivery: boolean;
  hasCollection: boolean;
  status?: string | null;
  mapCID?: string | null;
  amenitiesJson?: string | null;
  orderChannelsJson?: string | null;
  openingHoursJson?: string | null;
  detailUrl?: string | null;
}

export interface ScrapeSummary {
  chain: RestaurantChain;
  totalFound: number;
  halalFound: number;
  durationMs: number;
}

