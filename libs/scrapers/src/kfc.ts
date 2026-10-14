import type { KfcRestaurantInput } from '@halal-restaurants/types';

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

  return raw.map((r: any) => {
    const facilities = (r.facilities || []).map((f: any) => f.name);
    const isHalal = facilities.some((name: string) => name.toLowerCase().includes('halal'));

    return {
      storeId: r.storeid || r.refid,
      refId: r.refid,
      name: r.name,
      street: r.street,
      city: r.city,
      postalCode: r.postalcode,
      country: r.countryCode || 'GB',
      latitude: r.geolocation?.latitude,
      longitude: r.geolocation?.longitude,
      region: r.region,
      isHalal,
      hasDriveThru: facilities.some((name: string) => name.toLowerCase().includes('drive')),
      hasWifi: facilities.some((name: string) => name.toLowerCase().includes('wifi')),
      hasDisabilityAccess: facilities.some((name: string) => name.toLowerCase().includes('disability')),
      hasBabyChanging: facilities.some((name: string) => name.toLowerCase().includes('baby')),
      isVeganFriendly: facilities.some((name: string) => name.toLowerCase().includes('vegan')),
      judoPayId: r.judopayid,
      status: r.status,
      bagTaxType: r.bagtaxtype,
      defaultEtaMin: r.defaultEtaMin,
      defaultEtaMax: r.defaultEtaMax,
      facilitiesJson: JSON.stringify(r.facilities || []),
      orderModesJson: JSON.stringify(r.orderModes || []),
      openingHoursJson: JSON.stringify(r.hours || []),
      detailUrl: r.link ? `https://www.kfc.co.uk${r.link}` : null
    };
  });
}

