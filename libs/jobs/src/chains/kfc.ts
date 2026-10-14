import { scrapeKfcUk } from '@halal-restaurants/scrapers';
import { upsertKfcRestaurant, logScrapeAudit } from '@halal-restaurants/database';
import { KfcRestaurantInputSchema } from '@halal-restaurants/types';

export async function syncKfcRestaurants() {
  const startTime = Date.now();
  console.log('[Worker:KFC] Scraping KFC UK...');

  try {
    const rawKfcList = await scrapeKfcUk();
    let halalCount = 0;
    let validCount = 0;

    for (const item of rawKfcList) {
      const validation = KfcRestaurantInputSchema.safeParse(item);
      if (!validation.success) {
        console.warn(`[Worker:KFC] Skipping invalid KFC item storeId=${item.storeId}:`, validation.error.format());
        continue;
      }

      const cleanRecord = validation.data;
      if (cleanRecord.isHalal) halalCount++;
      await upsertKfcRestaurant(cleanRecord);
      validCount++;
    }

    const duration = Date.now() - startTime;
    await logScrapeAudit('KFC', validCount, halalCount, duration, 'SUCCESS');
    console.log(`[Worker:KFC] Sync finished: ${validCount} clean records upserted (${halalCount} Halal) in ${duration}ms`);

    return { chain: 'KFC', validCount, halalCount, duration };
  } catch (err: any) {
    console.error('[Worker:KFC] Sync failed:', err.message);
    await logScrapeAudit('KFC', 0, 0, Date.now() - startTime, 'FAILED', err.message);
    throw err;
  }
}

