import { KfcRestaurantInputSchema, type KfcRestaurantInput } from '@halal-restaurants/types';

export const KFC_API_URL = 'https://www.kfc.co.uk/api/cms/api/data/restaurants_all?countrycode=GB';

export async function scrapeKfcUk(): Promise<KfcRestaurantInput[]> {
  const res = await fetch(KFC_API_URL, {
    headers: {
      'x-api-key': 'siYAzKattmaIHSwMV9OJYtaoP8SRq',
      'countrycode': 'GB',
      'langcode': 'en',
      'codemarket': 'UK',
      'referer': 'https://www.kfc.co.uk/choose-restaurant',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`KFC API request failed with status: ${res.status} ${res.statusText}`);
  }

  const raw = await res.json();
  const validatedList: KfcRestaurantInput[] = [];

  for (const r of raw) {
    const facilities = (r.facilities || []).map((f: any) => f.name);
    const isHalal = facilities.some((name: string) => name.toLowerCase().includes('halal'));

    const candidate = {
      storeId: String(r.storeid || r.refid || '').trim(),
      refId: r.refid ? String(r.refid) : null,
      name: r.name ? String(r.name).trim() : 'Unknown KFC',
      street: r.street ? String(r.street).trim() : null,
      city: r.city ? String(r.city).trim() : null,
      postalCode: r.postalcode ? String(r.postalcode).trim() : null,
      country: r.countryCode || 'GB',
      latitude: r.geolocation?.latitude ?? null,
      longitude: r.geolocation?.longitude ?? null,
      region: r.region ? String(r.region).trim() : null,
      isHalal,
      hasDriveThru: facilities.some((name: string) => name.toLowerCase().includes('drive')),
      hasWifi: facilities.some((name: string) => name.toLowerCase().includes('wifi')),
      hasDisabilityAccess: facilities.some((name: string) => name.toLowerCase().includes('disability')),
      hasBabyChanging: facilities.some((name: string) => name.toLowerCase().includes('baby')),
      isVeganFriendly: facilities.some((name: string) => name.toLowerCase().includes('vegan')),
      judoPayId: r.judopayid ? String(r.judopayid) : null,
      status: r.status ? String(r.status) : null,
      bagTaxType: r.bagtaxtype ? String(r.bagtaxtype) : null,
      defaultEtaMin: typeof r.defaultEtaMin === 'number' ? r.defaultEtaMin : null,
      defaultEtaMax: typeof r.defaultEtaMax === 'number' ? r.defaultEtaMax : null,
      facilitiesJson: JSON.stringify(r.facilities || []),
      orderModesJson: JSON.stringify(r.orderModes || []),
      openingHoursJson: JSON.stringify(r.hours || []),
      detailUrl: r.link ? `https://www.kfc.co.uk${r.link}` : null
    };

    // Zod validation check
    const parseResult = KfcRestaurantInputSchema.safeParse(candidate);
    if (parseResult.success) {
      validatedList.push(parseResult.data);
    } else {
      console.warn(`[KFC Scraper] Validation skipped invalid record storeId=${candidate.storeId}:`, parseResult.error.format());
    }
  }

  return validatedList;
}
