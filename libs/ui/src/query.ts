import { QueryClient, useQuery } from '@tanstack/react-query';
import { MobileRestaurantListSchema, type MobileRestaurantItem } from '@halal-restaurants/types';

/**
 * Creates an optimized QueryClient with robust offline defaults
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60 * 24, // 24 hours (data is relatively static)
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache time
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true
      }
    }
  });
}

export interface UseRestaurantsOptions {
  queryKey: string[];
  offlineData: any[];
  fetcher?: () => Promise<any[]>;
}

/**
 * Universal hook using TanStack Query with bundled offline JSON fallback and Zod validation
 */
export function useRestaurants({ queryKey, offlineData, fetcher }: UseRestaurantsOptions) {
  // Validate bundled offline dataset with Zod
  const validatedOfflineData = MobileRestaurantListSchema.parse(offlineData);

  return useQuery<MobileRestaurantItem[]>({
    queryKey,
    queryFn: async () => {
      if (!fetcher) return validatedOfflineData;
      try {
        const raw = await fetcher();
        // Validate remote data with Zod
        return MobileRestaurantListSchema.parse(raw);
      } catch (err) {
        console.warn(`[TanStack Query] Remote fetch failed, falling back to offline JSON:`, err);
        return validatedOfflineData;
      }
    },
    initialData: validatedOfflineData
  });
}

