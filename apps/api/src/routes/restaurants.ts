import type { FastifyPluginAsync } from 'fastify';
import {
  searchRestaurants,
  findNearbyRestaurants,
  getRestaurantByChainAndId,
  chainRegistry
} from '@halal-restaurants/database';
import { RestaurantQuerySchema, NearbyQuerySchema } from '@halal-restaurants/types';

export const restaurantRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/chains
   * Supported restaurant chains metadata dynamically pulled from registered adapters
   */
  fastify.get('/chains', async () => {
    const chains = chainRegistry.getAll().map((adapter) => ({
      id: adapter.chainId,
      name: adapter.displayName,
      brandColor: adapter.brandColor,
      accentColor: adapter.accentColor,
      description: adapter.description,
      supportedFilters: adapter.supportedFilters
    }));

    return {
      success: true,
      data: chains
    };
  });

  /**
   * GET /api/v1/restaurants
   * Search restaurants with multi-filtering and pagination
   */
  fastify.get('/restaurants', async (req, reply) => {
    const parseResult = RestaurantQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid query parameters',
        issues: parseResult.error.format()
      });
    }

    const data = await searchRestaurants(parseResult.data);
    return {
      success: true,
      ...data
    };
  });

  /**
   * GET /api/v1/restaurants/nearby
   * Find nearby restaurants based on GPS coordinates
   */
  fastify.get('/restaurants/nearby', async (req, reply) => {
    const parseResult = NearbyQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error: 'Invalid nearby query parameters. lat and lng are required numbers.',
        issues: parseResult.error.format()
      });
    }

    const data = await findNearbyRestaurants(parseResult.data);
    return {
      success: true,
      ...data
    };
  });

  /**
   * GET /api/v1/restaurants/:chain/:id
   * Extensible single restaurant lookup supporting any registered chain
   */
  fastify.get<{ Params: { chain: string; id: string } }>(
    '/restaurants/:chain/:id',
    async (req, reply) => {
      const { chain, id } = req.params;

      if (!chainRegistry.has(chain)) {
        return reply.status(404).send({
          success: false,
          error: `Unknown chain '${chain}'. Supported chains: ${chainRegistry.getAll().map(a => a.chainId).join(', ')}`
        });
      }

      const store = await getRestaurantByChainAndId(chain, id);

      if (!store) {
        return reply.status(404).send({
          success: false,
          error: `Restaurant '${id}' not found in chain '${chain}'.`
        });
      }

      return {
        success: true,
        data: store
      };
    }
  );
};
