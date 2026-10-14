import { z } from 'zod';

export type RestaurantChain = 'KFC' | 'NANDOS' | (string & {});

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/**
 * Common presentation schema used by Mobile Apps, TanStack Query, and Web clients
 */
export const MobileRestaurantItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  street: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  distanceMiles: z.number().nullable().optional(),
  isHalal: z.boolean(),
  amenitiesList: z.array(z.string()).default([]),
  status: z.string().nullable().optional(),
  detailUrl: z.string().nullable().optional(),
  telephone: z.string().nullable().optional()
});

export const MobileRestaurantListSchema = z.array(MobileRestaurantItemSchema);

/**
 * API Query & Filter Schemas
 */
export const RestaurantQuerySchema = z.object({
  chain: z.string().default('all'),
  halal: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true'))
    .optional(),
  q: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().positive().default(10),
  driveThru: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true'))
    .optional(),
  outdoorSeating: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true'))
    .optional(),
  limit: z.coerce.number().int().min(1).max(500).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const NearbyQuerySchema = z.object({
  chain: z.string().default('all'),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().positive().default(10),
  halal: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true'))
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(30)
});

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

export type MobileRestaurantItem = z.infer<typeof MobileRestaurantItemSchema>;
export type MobileRestaurantList = z.infer<typeof MobileRestaurantListSchema>;
export type RestaurantQuery = z.infer<typeof RestaurantQuerySchema>;
export type NearbyQuery = z.infer<typeof NearbyQuerySchema>;
