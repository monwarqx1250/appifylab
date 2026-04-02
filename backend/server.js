require('dotenv').config();
const Fastify = require('fastify');
const appService = require('./app');

// Instantiate Fastify
const fastify = Fastify({
  logger: true,
});

// Register the app built by app.js
fastify.register(appService);
fastify.get('/', async (req, reply) => {
  reply.send({ message: 'Hello World!' });
});
// Export for testing
module.exports = fastify;

// Start server only when this file is run directly
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
