import { getRestaurantSyncQueue } from './queues';

/**
 * Schedule daily repeatable sync job (runs every day at 03:00 AM)
 */
export async function scheduleDailyRestaurantSync() {
  const queue = getRestaurantSyncQueue();

  // Add repeatable cron job
  await queue.add(
    'daily-uk-sync',
    { chain: 'ALL', triggeredBy: 'cron-schedule' },
    {
      repeat: {
        pattern: '0 3 * * *' // 3:00 AM daily
      },
      jobId: 'daily-uk-restaurants-sync'
    }
  );

  console.log('[Scheduler] Configured repeatable cron job: 0 3 * * * (Daily at 3:00 AM)');
}

/**
 * Trigger immediate one-off sync job
 */
export async function triggerManualSync(chain: 'KFC' | 'NANDOS' | 'ALL' = 'ALL') {
  const queue = getRestaurantSyncQueue();
  const job = await queue.add(`manual-sync-${chain.toLowerCase()}`, {
    chain,
    triggeredBy: 'manual-trigger'
  });
  console.log(`[Scheduler] Enqueued manual job ${job.id} for chain: ${chain}`);
  return job;
}

