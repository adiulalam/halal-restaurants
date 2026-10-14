/**
 * Nando's UK Reverse-Engineered Client
 * Target: https://www.nandos.co.uk/restaurants
 * Extracts Next.js App Router RSC stream payloads
 */

export async function fetchNandosUkRestaurants() {
  const url = 'https://www.nandos.co.uk/restaurants';
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-GB,en;q=0.9'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Nando's UK page: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Extract RSC chunks from self.__next_f.push([1, "..."])
  const nextFPushRegex = /self\.__next_f\.push\(\[\d+,"(.*?)"\]\)/gs;
  let streamText = '';
  let m;
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
  const positions = [];
  while ((pos = streamText.indexOf(marker, pos)) !== -1) {
    positions.push(pos);
    pos += marker.length;
  }

  const rawRestaurants = [];

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
        console.warn('Failed parsing segment:', err.message);
      }
    }
  }

  // Deduplicate by branchCode
  const uniqueMap = new Map();

  for (const r of rawRestaurants) {
    const branchCode = r.details?.branchCode || r.details?.slug;
    if (!branchCode || uniqueMap.has(branchCode)) continue;

    const amenities = r.amenities || [];
    const isHalal = amenities.includes('HALAL');
    const hasOutdoorSeating = amenities.includes('OUTDOOR_EATING_AREA');
    const hasBabyChanging = amenities.includes('BABY_CHANGING');
    const hasDisabledAccess = amenities.includes('DISABLED_ACCESS');
    const hasWifi = amenities.includes('WIFI');
    const hasDelivery = amenities.includes('DELIVERY');
    const hasCollection = amenities.includes('COLLECTION');

    uniqueMap.set(branchCode, {
      chain: 'NANDOS',
      chainId: branchCode,
      name: r.details?.name,
      street: r.geo?.address?.streetAddress,
      city: r.geo?.address?.addressLocality,
      postalCode: r.geo?.address?.postalCode,
      country: r.geo?.address?.addressCountry || 'GB',
      latitude: r.geo?.latitude,
      longitude: r.geo?.longitude,
      region: r.geo?.region,
      isHalal,
      amenities: {
        isHalal,
        hasOutdoorSeating,
        hasBabyChanging,
        hasDisabledAccess,
        hasWifi,
        hasDelivery,
        hasCollection,
        rawAmenities: amenities
      },
      telephone: r.contact?.telephone,
      status: r.restaurantStatus,
      orderChannels: r.orderChannels || {},
      openingHours: r.openingHoursSpecification || [],
      detailUrl: r.details?.slug ? `https://www.nandos.co.uk/restaurants/${r.details.slug}` : null
    });
  }

  return Array.from(uniqueMap.values());
}

// Quick run if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  fetchNandosUkRestaurants().then(restaurants => {
    console.log(`Fetched ${restaurants.length} Nando's UK restaurants`);
    console.log(`Halal count: ${restaurants.filter(r => r.isHalal).length}`);
    console.log(`Outdoor seating count: ${restaurants.filter(r => r.amenities.hasOutdoorSeating).length}`);
    console.log('Sample item:', restaurants[0]);
  }).catch(console.error);
}

