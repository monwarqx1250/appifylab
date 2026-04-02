const fp = require('fastify-plugin');
const { PrismaClient } = require('@prisma/client');

module.exports = fp(async function (fastify, opts) {
  // Use TEST_DATABASE_URL if available (for test isolation), otherwise fallback to default behavior (env/dotenv)
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  await prisma.$connect();

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (server) => {
    await server.prisma.$disconnect();
  });
});
