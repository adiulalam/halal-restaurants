import { z } from 'zod';

/**
 * -------------------------------------------------------------
 * KFC Zod Schemas
 * -------------------------------------------------------------
 */

export const KfcRawFacilitySchema = z.object({
  name: z.string(),
  imagePath: z.string().optional()
});

export const KfcRawGeolocationSchema = z.object({
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional()
});

export const KfcRawRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  street: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalcode: z.string().nullable().optional(),
  countryCode: z.string().default('GB'),
  marketCode: z.string().optional(),
  storeid: z.string().optional(),
  refid: z.string().optional(),
  geolocation: KfcRawGeolocationSchema.optional(),
  region: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  judopayid: z.string().nullable().optional(),
  bagtaxtype: z.string().nullable().optional(),
  defaultEtaMin: z.number().nullable().optional(),
  defaultEtaMax: z.number().nullable().optional(),
  facilities: z.array(KfcRawFacilitySchema).default([]),
  orderModes: z.array(z.any()).default([]),
  hours: z.array(z.any()).default([]),
  link: z.string().nullable().optional()
});

export const KfcRestaurantInputSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  refId: z.string().nullable().optional(),
  name: z.string().min(1, 'Name is required'),
  street: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().default('GB'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  isHalal: z.boolean(),
  hasDriveThru: z.boolean().default(false),
  hasWifi: z.boolean().default(false),
  hasDisabilityAccess: z.boolean().default(false),
  hasBabyChanging: z.boolean().default(false),
  isVeganFriendly: z.boolean().default(false),
  judoPayId: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  bagTaxType: z.string().nullable().optional(),
  defaultEtaMin: z.number().nullable().optional(),
  defaultEtaMax: z.number().nullable().optional(),
  facilitiesJson: z.string().nullable().optional(),
  orderModesJson: z.string().nullable().optional(),
  openingHoursJson: z.string().nullable().optional(),
  detailUrl: z.string().nullable().optional()
});

/**
 * -------------------------------------------------------------
 * Nando's Zod Schemas
 * -------------------------------------------------------------
 */

export const NandosRestaurantInputSchema = z.object({
  branchCode: z.string().min(1, 'Branch code is required'),
  name: z.string().min(1, 'Restaurant name is required'),
  slug: z.string().nullable().optional(),
  seoSlug: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  country: z.string().default('GB'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  isHalal: z.boolean(),
  hasOutdoorSeating: z.boolean().default(false),
  hasBabyChanging: z.boolean().default(false),
  hasDisabledAccess: z.boolean().default(false),
  hasWifi: z.boolean().default(false),
  hasDelivery: z.boolean().default(false),
  hasCollection: z.boolean().default(false),
  status: z.string().nullable().optional(),
  mapCID: z.string().nullable().optional(),
  amenitiesJson: z.string().nullable().optional(),
  orderChannelsJson: z.string().nullable().optional(),
  openingHoursJson: z.string().nullable().optional(),
  detailUrl: z.string().nullable().optional()
});

/**
 * -------------------------------------------------------------
 * Mobile App Client Presentation Schemas (TanStack Query / Offline)
 * -------------------------------------------------------------
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
 * -------------------------------------------------------------
 * API Query & Filter Schemas
 * -------------------------------------------------------------
 */

export const RestaurantQuerySchema = z.object({
  chain: z.enum(['kfc', 'nandos', 'all']).default('all'),
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
  chain: z.enum(['kfc', 'nandos', 'all']).default('all'),
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

/**
 * -------------------------------------------------------------
 * Inferred Types from Zod
 * -------------------------------------------------------------
 */
export type KfcRawRestaurant = z.infer<typeof KfcRawRestaurantSchema>;
export type KfcRestaurantInput = z.infer<typeof KfcRestaurantInputSchema>;
export type NandosRestaurantInput = z.infer<typeof NandosRestaurantInputSchema>;
export type MobileRestaurantItem = z.infer<typeof MobileRestaurantItemSchema>;
export type MobileRestaurantList = z.infer<typeof MobileRestaurantListSchema>;
export type RestaurantQuery = z.infer<typeof RestaurantQuerySchema>;
export type NearbyQuery = z.infer<typeof NearbyQuerySchema>;

