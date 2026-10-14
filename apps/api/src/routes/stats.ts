import type { FastifyPluginAsync } from 'fastify';
import { getDatabaseStats } from '@halal-restaurants/database';

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/stats', async () => {
    const stats = await getDatabaseStats();
    return {
      success: true,
      data: stats
    };
  });
};
