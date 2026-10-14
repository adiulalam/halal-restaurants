import type { MobileRestaurantItem, RestaurantQuery } from '@halal-restaurants/types';

export interface ChainStats {
  total: number;
  halal: number;
  nonHalal: number;
  halalPercentage: number;
  [key: string]: any;
}

export interface RestaurantChainAdapter {
  readonly chainId: string;
  readonly displayName: string;
  readonly brandColor: string;
  readonly accentColor?: string;
  readonly description?: string;
  readonly supportedFilters: string[];

  search(query: RestaurantQuery): Promise<MobileRestaurantItem[]>;
  getById(id: string): Promise<any | null>;
  getStats(): Promise<ChainStats>;
}
