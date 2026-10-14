import fs from 'fs';
import path from 'path';
import { prisma, upsertKfcRestaurant, upsertNandosRestaurant, logScrapeAudit } from './index';

async function seed() {
  console.log('--- Starting Seed into SQLite Database ---');

  // 1. Seed KFC
  const kfcPath = path.resolve(process.cwd(), 'kfc_restaurants_all_sample.json');
  if (fs.existsSync(kfcPath)) {
    const rawKfc = JSON.parse(fs.readFileSync(kfcPath, 'utf8'));
    console.log(`Loading ${rawKfc.length} KFC restaurants...`);
    const startTime = Date.now();
    let halalCount = 0;

    for (const r of rawKfc) {
      const facilityNames = (r.facilities || []).map((f: any) => f.name);
      const isHalal = facilityNames.some((n: string) => n.toLowerCase().includes('halal'));
      if (isHalal) halalCount++;

      await upsertKfcRestaurant({
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
        hasDriveThru: facilityNames.some((n: string) => n.toLowerCase().includes('drive')),
        hasWifi: facilityNames.some((n: string) => n.toLowerCase().includes('wifi')),
        hasDisabilityAccess: facilityNames.some((n: string) => n.toLowerCase().includes('disability')),
        hasBabyChanging: facilityNames.some((n: string) => n.toLowerCase().includes('baby')),
        isVeganFriendly: facilityNames.some((n: string) => n.toLowerCase().includes('vegan')),
        judoPayId: r.judopayid,
        status: r.status,
        bagTaxType: r.bagtaxtype,
        defaultEtaMin: r.defaultEtaMin,
        defaultEtaMax: r.defaultEtaMax,
        facilitiesJson: JSON.stringify(r.facilities || []),
        orderModesJson: JSON.stringify(r.orderModes || []),
        openingHoursJson: JSON.stringify(r.hours || []),
        detailUrl: r.link ? `https://www.kfc.co.uk${r.link}` : null
      });
    }

    const duration = Date.now() - startTime;
    await logScrapeAudit('KFC', rawKfc.length, halalCount, duration);
    console.log(`✔ KFC Seed complete: ${rawKfc.length} saved (${halalCount} Halal) in ${duration}ms`);
  }

  // 2. Seed Nando's
  const nandosPath = path.resolve(process.cwd(), 'nandos_restaurants_all_sample.json');
  if (fs.existsSync(nandosPath)) {
    const rawNandos = JSON.parse(fs.readFileSync(nandosPath, 'utf8'));
    console.log(`Loading ${rawNandos.length} Nando's restaurants...`);
    const startTime = Date.now();
    let halalCount = 0;

    for (const r of rawNandos) {
      const amenities = r.amenities || [];
      const isHalal = amenities.includes('HALAL');
      if (isHalal) halalCount++;

      await upsertNandosRestaurant({
        branchCode: r.details?.branchCode || r.details?.slug,
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

    const duration = Date.now() - startTime;
    await logScrapeAudit('NANDOS', rawNandos.length, halalCount, duration);
    console.log(`✔ Nando's Seed complete: ${rawNandos.length} saved (${halalCount} Halal) in ${duration}ms`);
  }

  // Verification counts
  const totalKfc = await prisma.kfcRestaurant.count();
  const halalKfc = await prisma.kfcRestaurant.count({ where: { isHalal: true } });
  const totalNandos = await prisma.nandosRestaurant.count();
  const halalNandos = await prisma.nandosRestaurant.count({ where: { isHalal: true } });

  console.log('\n--- Database Stats in SQLite (dev.db) ---');
  console.log(`KFC Table:      ${totalKfc} total, ${halalKfc} Halal`);
  console.log(`Nando's Table:  ${totalNandos} total, ${halalNandos} Halal`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

