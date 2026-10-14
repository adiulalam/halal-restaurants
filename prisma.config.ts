import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import path from 'path';

export default defineConfig({
  schema: 'libs/database/prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL') || `file:${path.resolve(__dirname, 'libs/database/prisma/dev.db')}`,
  },
});
