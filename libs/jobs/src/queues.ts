import { Queue } from 'bullmq';
import { getRedisConnection } from './connection';

export const RESTAURANT_QUEUE_NAME = 'restaurant-sync';

export interface SyncJobPayload {
  chain: 'KFC' | 'NANDOS' | 'ALL';
  triggeredBy?: string;
}

let syncQueue: Queue<SyncJobPayload> | null = null;

export function getRestaurantSyncQueue(): Queue<SyncJobPayload> {
  if (!syncQueue) {
    syncQueue = new Queue<SyncJobPayload>(RESTAURANT_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 500
      }
    });
  }
  return syncQueue;
}

