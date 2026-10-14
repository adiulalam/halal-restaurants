import { z } from 'zod';

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

export type KfcRawFacility = z.infer<typeof KfcRawFacilitySchema>;
export type KfcRawRestaurant = z.infer<typeof KfcRawRestaurantSchema>;
export type KfcRestaurantInput = z.infer<typeof KfcRestaurantInputSchema>;
