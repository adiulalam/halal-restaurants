/**
 * KFC UK Reverse-Engineered Client
 * Endpoint: https://www.kfc.co.uk/api/cms/api/data/restaurants_all?countrycode=GB
 */

export async function fetchKfcUkRestaurants() {
  const url = 'https://www.kfc.co.uk/api/cms/api/data/restaurants_all?countrycode=GB';
  const res = await fetch(url, {
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
    throw new Error(`Failed to fetch KFC UK restaurants: ${res.status} ${res.statusText}`);
  }

  const rawRestaurants = await res.json();

  return rawRestaurants.map(r => {
    const facilityNames = (r.facilities || []).map(f => f.name);
    const isHalal = facilityNames.some(name => name.toLowerCase().includes('halal'));
    const hasDriveThru = facilityNames.some(name => name.toLowerCase().includes('drive'));
    const isVeganFriendly = facilityNames.some(name => name.toLowerCase().includes('vegan'));
    const hasWifi = facilityNames.some(name => name.toLowerCase().includes('wifi'));
    const hasDisabilityAccess = facilityNames.some(name => name.toLowerCase().includes('disability'));
    const hasBabyChanging = facilityNames.some(name => name.toLowerCase().includes('baby'));

    return {
      chain: 'KFC',
      chainId: r.storeid || r.refid,
      name: r.name,
      street: r.street,
      city: r.city,
      postalCode: r.postalcode,
      country: r.countryCode || 'GB',
      latitude: r.geolocation?.latitude,
      longitude: r.geolocation?.longitude,
      region: r.region,
      isHalal,
      amenities: {
        isHalal,
        hasDriveThru,
        hasWifi,
        hasDisabilityAccess,
        hasBabyChanging,
        isVeganFriendly,
        rawFacilities: facilityNames
      },
      orderModes: (r.orderModes || []).map(m => `${m.modeType}_${m.serviceType}`),
      openingHours: r.hours || [],
      detailUrl: r.link ? `https://www.kfc.co.uk${r.link}` : null
    };
  });
}

// Quick run if executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  fetchKfcUkRestaurants().then(restaurants => {
    console.log(`Fetched ${restaurants.length} KFC UK restaurants`);
    console.log(`Halal count: ${restaurants.filter(r => r.isHalal).length}`);
    console.log('Sample item:', restaurants[0]);
  }).catch(console.error);
}

