import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './connection';
import { RESTAURANT_QUEUE_NAME, SyncJobPayload } from './queues';
import { scrapeKfcUk, scrapeNandosUk } from '@halal-restaurants/scrapers';
import { upsertKfcRestaurant, upsertNandosRestaurant, logScrapeAudit } from '@halal-restaurants/database';

export function createRestaurantSyncWorker(): Worker<SyncJobPayload> {
  const worker = new Worker<SyncJobPayload>(
    RESTAURANT_QUEUE_NAME,
    async (job: Job<SyncJobPayload>) => {
      console.log(`[Worker] Started job ${job.id} (${job.name}) for chain: ${job.data.chain}`);
      const startTime = Date.now();

      if (job.data.chain === 'KFC' || job.data.chain === 'ALL') {
        try {
          console.log('[Worker] Scraping KFC UK...');
          const kfcList = await scrapeKfcUk();
          let halalCount = 0;

          for (const item of kfcList) {
            if (item.isHalal) halalCount++;
            await upsertKfcRestaurant(item);
          }

          const duration = Date.now() - startTime;
          await logScrapeAudit('KFC', kfcList.length, halalCount, duration, 'SUCCESS');
          console.log(`[Worker] KFC sync finished: ${kfcList.length} processed (${halalCount} Halal) in ${duration}ms`);
        } catch (err: any) {
          console.error('[Worker] KFC sync failed:', err.message);
          await logScrapeAudit('KFC', 0, 0, Date.now() - startTime, 'FAILED', err.message);
          throw err;
        }
      }

      if (job.data.chain === 'NANDOS' || job.data.chain === 'ALL') {
        const nandosStart = Date.now();
        try {
          console.log('[Worker] Scraping Nando\'s UK...');
          const nandosList = await scrapeNandosUk();
          let halalCount = 0;

          for (const item of nandosList) {
            if (item.isHalal) halalCount++;
            await upsertNandosRestaurant(item);
          }

          const duration = Date.now() - nandosStart;
          await logScrapeAudit('NANDOS', nandosList.length, halalCount, duration, 'SUCCESS');
          console.log(`[Worker] Nando's sync finished: ${nandosList.length} processed (${halalCount} Halal) in ${duration}ms`);
        } catch (err: any) {
          console.error('[Worker] Nando\'s sync failed:', err.message);
          await logScrapeAudit('NANDOS', 0, 0, Date.now() - nandosStart, 'FAILED', err.message);
          throw err;
        }
      }

      return { status: 'COMPLETED', finishedAt: new Date().toISOString() };
    },
    {
      connection: getRedisConnection(),
      concurrency: 2
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}

