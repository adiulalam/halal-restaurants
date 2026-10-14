import { Worker, Job } from 'bullmq';
import { getRedisConnection } from './connection';
import { RESTAURANT_QUEUE_NAME, SyncJobPayload } from './queues';
import { jobChainRegistry } from './chains/registry';

export function createRestaurantSyncWorker(): Worker<SyncJobPayload> {
  const worker = new Worker<SyncJobPayload>(
    RESTAURANT_QUEUE_NAME,
    async (job: Job<SyncJobPayload>) => {
      console.log(`[Worker] Started job ${job.id} (${job.name}) for chain: ${job.data.chain}`);

      const chain = (job.data.chain || 'ALL').toUpperCase();

      if (chain === 'ALL') {
        const results = [];
        for (const syncFn of jobChainRegistry.getAll()) {
          results.push(await syncFn());
        }
        return { status: 'COMPLETED', results, finishedAt: new Date().toISOString() };
      }

      const syncHandler = jobChainRegistry.get(chain);
      if (!syncHandler) {
        throw new Error(
          `Unknown chain '${chain}'. Supported chains: ${jobChainRegistry.getSupportedChains().join(', ')}`
        );
      }

      const result = await syncHandler();
      return { status: 'COMPLETED', result, finishedAt: new Date().toISOString() };
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

export * from './chains/registry';
