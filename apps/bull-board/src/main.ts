import Fastify from 'fastify';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { getRestaurantSyncQueue, triggerManualSync } from '@halal-restaurants/jobs';

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }
  });

  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // Connect BullMQ queue to Bull-Board UI
  const restaurantQueue = getRestaurantSyncQueue();
  createBullBoard({
    queues: [new BullMQAdapter(restaurantQueue as any)],
    serverAdapter,
    options: {
      uiConfig: {
        boardTitle: 'UK Halal Restaurants - Job Queues (Sidekiq Equivalent)'
      }
    }
  });

  // Register Bull-Board plugin
  await app.register(serverAdapter.registerPlugin(), {
    prefix: '/admin/queues'
  });

  // Root redirect directly to dashboard
  app.get('/', async (_req, reply) => {
    return reply.redirect('/admin/queues');
  });

  // Health endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'bull-board-dashboard',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  });

  // Quick trigger endpoints for testing scrapers via dashboard
  app.post<{ Params: { chain: string } }>('/api/trigger/:chain', async (req) => {
    const chainParam = req.params.chain.toUpperCase();
    const chain = chainParam === 'KFC' || chainParam === 'NANDOS' ? chainParam : 'ALL';

    const job = await triggerManualSync(chain);
    return {
      success: true,
      message: `Enqueued ${chain} scrape job successfully`,
      jobId: job.id,
      jobName: job.name
    };
  });

  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    const address = await app.listen({ port, host });
    console.log('====================================================');
    console.log(' Bull-Board Web Dashboard (Sidekiq Web Equivalent)');
    console.log(` Web UI:        ${address}/admin/queues`);
    console.log(` Home Redirect: ${address}/`);
    console.log(' Queue Monitored: "restaurant-sync" (KFC & Nando\'s UK)');
    console.log('====================================================');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[Bull-Board UI] Shutting down gracefully...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();

