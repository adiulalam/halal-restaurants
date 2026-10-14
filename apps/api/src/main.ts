import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { getRestaurantSyncQueue } from '@halal-restaurants/jobs';
import { healthRoutes } from './routes/health';
import { statsRoutes } from './routes/stats';
import { restaurantRoutes } from './routes/restaurants';

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }
  });

  // Enable CORS for mobile apps, Expo dev servers, and web clients
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Bull-Board Web Dashboard (Sidekiq Web UI equivalent)
  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath('/admin/queues');
  try {
    createBullBoard({
      queues: [new BullMQAdapter(getRestaurantSyncQueue() as any)],
      serverAdapter,
      options: {
        uiConfig: {
          boardTitle: 'UK Halal Restaurants - Background Job Queues'
        }
      }
    });
    await app.register(serverAdapter.registerPlugin(), { prefix: '/admin/queues' });
  } catch (err: any) {
    app.log.warn(`[Bull-Board] Queue UI disabled: ${err.message}`);
  }

  // Register Health Routes
  await app.register(healthRoutes);
  await app.register(healthRoutes, { prefix: '/api/v1' });

  // Register API Routes
  await app.register(statsRoutes, { prefix: '/api/v1' });
  await app.register(restaurantRoutes, { prefix: '/api/v1' });

  // Root welcoming route
  app.get('/', async () => {
    return {
      name: 'UK Halal Restaurants API',
      version: '1.0.0',
      description: 'REST API providing verified UK Halal KFC & Nando\'s data with geo-queries',
      endpoints: {
        health: '/health',
        stats: '/api/v1/stats',
        chains: '/api/v1/chains',
        restaurants: '/api/v1/restaurants',
        nearby: '/api/v1/restaurants/nearby',
        kfcDetail: '/api/v1/restaurants/kfc/:id',
        nandosDetail: '/api/v1/restaurants/nandos/:id',
        jobsDashboard: '/admin/queues'
      }
    };
  });

  const port = Number(process.env.PORT) || 3001;
  const host = process.env.HOST || '0.0.0.0';

  try {
    const address = await app.listen({ port, host });
    console.log('====================================================');
    console.log(` UK Halal Restaurants API is running!`);
    console.log(` Address: ${address}`);
    console.log(` Endpoints:`);
    console.log(` - Health:        ${address}/health`);
    console.log(` - Stats:         ${address}/api/v1/stats`);
    console.log(` - Chains:        ${address}/api/v1/chains`);
    console.log(` - Search:        ${address}/api/v1/restaurants?halal=true&q=London`);
    console.log(` - Nearby:        ${address}/api/v1/restaurants/nearby?lat=51.5&lng=-0.1`);
    console.log(` - Job Queues UI: ${address}/admin/queues`);
    console.log('====================================================');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[API Service] Shutting down gracefully...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();
