require('dotenv').config();
const Fastify = require('fastify');
const appService = require('./app');

const fastify = Fastify({
  logger: true,
});

fastify.register(appService);

fastify.get('/', async (req, reply) => {
  reply.send({
    "message": "Welcome to the API. Please use /docs for API documentation."
  });
});

module.exports = fastify;

if (require.main === module) {
  const start = async () => {
    try {
      await fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' });
      fastify.log.info(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}
