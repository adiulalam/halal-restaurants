import type { RestaurantChainAdapter } from './types';
import { kfcAdapter } from './kfc';
import { nandosAdapter } from './nandos';

class ChainRegistry {
  private adapters = new Map<string, RestaurantChainAdapter>();

  constructor() {
    // Automatically register default built-in UK restaurant chains
    this.register(kfcAdapter);
    this.register(nandosAdapter);
  }

  register(adapter: RestaurantChainAdapter): void {
    this.adapters.set(adapter.chainId.toLowerCase(), adapter);
  }

  get(chainId: string): RestaurantChainAdapter | undefined {
    return this.adapters.get(chainId.toLowerCase());
  }

  getAll(): RestaurantChainAdapter[] {
    return Array.from(this.adapters.values());
  }

  has(chainId: string): boolean {
    return this.adapters.has(chainId.toLowerCase());
  }
}

export const chainRegistry = new ChainRegistry();
export * from './types';
export * from './kfc';
export * from './nandos';
