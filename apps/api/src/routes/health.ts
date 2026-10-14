import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'halal-restaurants-api',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  });
};

