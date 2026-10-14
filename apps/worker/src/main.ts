import { createRestaurantSyncWorker, scheduleDailyRestaurantSync } from '@halal-restaurants/jobs';

async function bootstrap() {
  console.log('====================================================');
  console.log(' Starting Halal Restaurants Background Worker');
  console.log(' Engine: BullMQ (Sidekiq-equivalent for TypeScript)');
  console.log(' Storage: SQLite (via Prisma)');
  console.log('====================================================');

  try {
    // 1. Start BullMQ worker
    const worker = createRestaurantSyncWorker();
    console.log('[Worker Service] Listening for sync jobs on queue "restaurant-sync"...');

    // 2. Register daily recurring cron schedule (3 AM)
    await scheduleDailyRestaurantSync();

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n[Worker Service] Shutting down gracefully...');
      await worker.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err: any) {
    console.error('[Worker Service] Fatal bootstrap error:', err.message);
    process.exit(1);
  }
}

bootstrap();

