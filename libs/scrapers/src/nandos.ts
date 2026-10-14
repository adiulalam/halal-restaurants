import { NandosRestaurantInputSchema, type NandosRestaurantInput } from '@halal-restaurants/types';

export const NANDOS_PAGE_URL = 'https://www.nandos.co.uk/restaurants';

export async function scrapeNandosUk(): Promise<NandosRestaurantInput[]> {
  const res = await fetch(NANDOS_PAGE_URL, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-GB,en;q=0.9'
    }
  });

  if (!res.ok) {
    throw new Error(`Nando's page request failed with status: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Extract RSC chunks from self.__next_f.push([1, "..."])
  const nextFPushRegex = /self\.__next_f\.push\(\[\d+,"(.*?)"\]\)/gs;
  let streamText = '';
  let m: RegExpExecArray | null;

  while ((m = nextFPushRegex.exec(html)) !== null) {
    try {
      streamText += JSON.parse(`"${m[1]}"`);
    } catch {
      streamText += m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
  }

  const marker = '"restaurants":[';
  let pos = 0;
  const positions: number[] = [];
  while ((pos = streamText.indexOf(marker, pos)) !== -1) {
    positions.push(pos);
    pos += marker.length;
  }

  const rawRestaurants: any[] = [];

  for (const startPos of positions) {
    const arrayStart = startPos + '"restaurants":'.length;
    let depth = 0;
    let endPos = -1;
    for (let i = arrayStart; i < streamText.length; i++) {
      if (streamText[i] === '[') depth++;
      else if (streamText[i] === ']') {
        depth--;
        if (depth === 0) {
          endPos = i + 1;
          break;
        }
      }
    }

    if (endPos !== -1) {
      const slice = streamText.slice(arrayStart, endPos);
      try {
        const cleaned = slice.replace(/"\$undefined"/g, 'null');
        const parsed = JSON.parse(cleaned);
        rawRestaurants.push(...parsed);
      } catch {
        // Skip unparseable slice
      }
    }
  }

  const uniqueMap = new Map<string, NandosRestaurantInput>();

  for (const r of rawRestaurants) {
    const branchCode = String(r.details?.branchCode || r.details?.slug || '').trim();
    if (!branchCode || uniqueMap.has(branchCode)) continue;

    const amenities: string[] = r.amenities || [];
    const isHalal = amenities.includes('HALAL');

    const candidate = {
      branchCode,
      name: r.details?.name ? String(r.details.name).trim() : 'Unknown Nando\'s',
      slug: r.details?.slug ? String(r.details.slug) : null,
      seoSlug: r.details?.seoSlug ? String(r.details.seoSlug) : null,
      street: r.geo?.address?.streetAddress ? String(r.geo.address.streetAddress).trim() : null,
      city: r.geo?.address?.addressLocality ? String(r.geo.address.addressLocality).trim() : null,
      postalCode: r.geo?.address?.postalCode ? String(r.geo.address.postalCode).trim() : null,
      country: r.geo?.address?.addressCountry || 'GB',
      latitude: typeof r.geo?.latitude === 'number' ? r.geo.latitude : null,
      longitude: typeof r.geo?.longitude === 'number' ? r.geo.longitude : null,
      region: r.geo?.region ? String(r.geo.region).trim() : null,
      telephone: r.contact?.telephone ? String(r.contact.telephone).trim() : null,
      isHalal,
      hasOutdoorSeating: amenities.includes('OUTDOOR_EATING_AREA'),
      hasBabyChanging: amenities.includes('BABY_CHANGING'),
      hasDisabledAccess: amenities.includes('DISABLED_ACCESS'),
      hasWifi: amenities.includes('WIFI'),
      hasDelivery: amenities.includes('DELIVERY'),
      hasCollection: amenities.includes('COLLECTION'),
      status: r.restaurantStatus ? String(r.restaurantStatus) : null,
      mapCID: r.mapCID ? String(r.mapCID) : null,
      amenitiesJson: JSON.stringify(amenities),
      orderChannelsJson: JSON.stringify(r.orderChannels || {}),
      openingHoursJson: JSON.stringify(r.openingHoursSpecification || []),
      detailUrl: r.details?.slug ? `https://www.nandos.co.uk/restaurants/${r.details.slug}` : null
    };

    // Zod validation check
    const parseResult = NandosRestaurantInputSchema.safeParse(candidate);
    if (parseResult.success) {
      uniqueMap.set(branchCode, parseResult.data);
    } else {
      console.warn(`[Nando's Scraper] Validation skipped invalid record branchCode=${branchCode}:`, parseResult.error.format());
    }
  }

  return Array.from(uniqueMap.values());
}

export function formatNandosToMobileItem(branch: NandosRestaurantInput): import('@halal-restaurants/types').MobileRestaurantItem {
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
      // Ignore
    }
  }

  return {
    id: `nandos-${branch.branchCode}`,
    name: branch.name,
    street: branch.street,
    city: branch.city,
    postalCode: branch.postalCode,
    latitude: branch.latitude,
    longitude: branch.longitude,
    distanceMiles: null,
    isHalal: branch.isHalal,
    amenitiesList: list,
    status: branch.status,
    detailUrl: branch.detailUrl,
    telephone: branch.telephone
  };
}

export async function fetchNandosMobileRestaurants(): Promise<import('@halal-restaurants/types').MobileRestaurantItem[]> {
  const branches = await scrapeNandosUk();
  return branches.map(formatNandosToMobileItem);
}
