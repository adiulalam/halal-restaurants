import type { NandosRestaurantInput } from '@halal-restaurants/types';

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

  // Find all "restaurants":[ occurrences in the stream
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
      } catch (err) {
        // Skip unparseable slice
      }
    }
  }

  // Deduplicate by branchCode
  const uniqueMap = new Map<string, NandosRestaurantInput>();

  for (const r of rawRestaurants) {
    const branchCode = r.details?.branchCode || r.details?.slug;
    if (!branchCode || uniqueMap.has(branchCode)) continue;

    const amenities: string[] = r.amenities || [];
    const isHalal = amenities.includes('HALAL');

    uniqueMap.set(branchCode, {
      branchCode,
      name: r.details?.name,
      slug: r.details?.slug,
      seoSlug: r.details?.seoSlug,
      street: r.geo?.address?.streetAddress,
      city: r.geo?.address?.addressLocality,
      postalCode: r.geo?.address?.postalCode,
      country: r.geo?.address?.addressCountry || 'GB',
      latitude: r.geo?.latitude,
      longitude: r.geo?.longitude,
      region: r.geo?.region,
      telephone: r.contact?.telephone,
      isHalal,
      hasOutdoorSeating: amenities.includes('OUTDOOR_EATING_AREA'),
      hasBabyChanging: amenities.includes('BABY_CHANGING'),
      hasDisabledAccess: amenities.includes('DISABLED_ACCESS'),
      hasWifi: amenities.includes('WIFI'),
      hasDelivery: amenities.includes('DELIVERY'),
      hasCollection: amenities.includes('COLLECTION'),
      status: r.restaurantStatus,
      mapCID: r.mapCID,
      amenitiesJson: JSON.stringify(amenities),
      orderChannelsJson: JSON.stringify(r.orderChannels || {}),
      openingHoursJson: JSON.stringify(r.openingHoursSpecification || []),
      detailUrl: r.details?.slug ? `https://www.nandos.co.uk/restaurants/${r.details.slug}` : null
    });
  }

  return Array.from(uniqueMap.values());
}

