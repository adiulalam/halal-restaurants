import type { FastifyPluginAsync } from 'fastify';
import {
  searchRestaurants,
  findNearbyRestaurants,
  getKfcRestaurantById,
  getNandosRestaurantById
} from '@halal-restaurants/database';
import { RestaurantQuerySchema, NearbyQuerySchema } from '@halal-restaurants/types';

export const restaurantRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /api/v1/chains
   * Supported restaurant chains metadata
   */
  fastify.get('/chains', async () => {
    return {
      success: true,
      data: [
        {
          id: 'kfc',
          name: 'KFC UK',
          brandColor: '#E4002B',
          accentColor: '#1C1917',
          description: 'Official UK KFC restaurants with certified Halal filtering',
          supportedFilters: ['halal', 'driveThru', 'wifi', 'babyChanging', 'disabilityAccess']
        },
        {
          id: 'nandos',
          name: "Nando's UK",
          brandColor: '#BA1B1D',
          accentColor: '#F5B041',
          description: "Official UK Nando's restaurants with certified Halal filtering",
          supportedFilters: ['halal', 'outdoorSeating', 'wifi', 'babyChanging', 'disabledAccess']
        }
      ]
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
   * GET /api/v1/restaurants/kfc/:id
   * Get single KFC store details
   */
  fastify.get<{ Params: { id: string } }>('/restaurants/kfc/:id', async (req, reply) => {
    const { id } = req.params;
    const store = await getKfcRestaurantById(id);

    if (!store) {
      return reply.status(404).send({
        success: false,
        error: `KFC restaurant with storeId '${id}' not found.`
      });
    }

    return {
      success: true,
      data: store
    };
  });

  /**
   * GET /api/v1/restaurants/nandos/:id
   * Get single Nando's branch details
   */
  fastify.get<{ Params: { id: string } }>('/restaurants/nandos/:id', async (req, reply) => {
    const { id } = req.params;
    const store = await getNandosRestaurantById(id);

    if (!store) {
      return reply.status(404).send({
        success: false,
        error: `Nando's restaurant with branchCode '${id}' not found.`
      });
    }

    return {
      success: true,
      data: store
    };
  });
};
