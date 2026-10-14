import { z } from 'zod';

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

export type NandosRestaurantInput = z.infer<typeof NandosRestaurantInputSchema>;
