import { scrapeNandosUk } from '@halal-restaurants/scrapers';
import { upsertNandosRestaurant, logScrapeAudit } from '@halal-restaurants/database';
import { NandosRestaurantInputSchema } from '@halal-restaurants/types';

export async function syncNandosRestaurants() {
  const startTime = Date.now();
  console.log('[Worker:Nandos] Scraping Nando\'s UK...');

  try {
    const rawNandosList = await scrapeNandosUk();
    let halalCount = 0;
    let validCount = 0;

    for (const item of rawNandosList) {
      const validation = NandosRestaurantInputSchema.safeParse(item);
      if (!validation.success) {
        console.warn(`[Worker:Nandos] Skipping invalid Nando's item branchCode=${item.branchCode}:`, validation.error.format());
        continue;
      }

      const cleanRecord = validation.data;
      if (cleanRecord.isHalal) halalCount++;
      await upsertNandosRestaurant(cleanRecord);
      validCount++;
    }

    const duration = Date.now() - startTime;
    await logScrapeAudit('NANDOS', validCount, halalCount, duration, 'SUCCESS');
    console.log(`[Worker:Nandos] Sync finished: ${validCount} clean records upserted (${halalCount} Halal) in ${duration}ms`);

    return { chain: 'NANDOS', validCount, halalCount, duration };
  } catch (err: any) {
    console.error('[Worker:Nandos] Sync failed:', err.message);
    await logScrapeAudit('NANDOS', 0, 0, Date.now() - startTime, 'FAILED', err.message);
    throw err;
  }
}

