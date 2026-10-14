import { syncKfcRestaurants } from './kfc';
import { syncNandosRestaurants } from './nandos';

export type ChainSyncFunction = () => Promise<{ chain: string; validCount: number; halalCount: number; duration: number }>;

class JobChainRegistry {
  private syncHandlers = new Map<string, ChainSyncFunction>();

  constructor() {
    this.register('KFC', syncKfcRestaurants);
    this.register('NANDOS', syncNandosRestaurants);
  }

  register(chain: string, handler: ChainSyncFunction): void {
    this.syncHandlers.set(chain.toUpperCase(), handler);
  }

  get(chain: string): ChainSyncFunction | undefined {
    return this.syncHandlers.get(chain.toUpperCase());
  }

  getAll(): ChainSyncFunction[] {
    return Array.from(this.syncHandlers.values());
  }

  getSupportedChains(): string[] {
    return Array.from(this.syncHandlers.keys());
  }
}

export const jobChainRegistry = new JobChainRegistry();
export * from './kfc';
export * from './nandos';

