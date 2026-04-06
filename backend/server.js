require('dotenv').config();
const Fastify = require('fastify');
const appService = require('./app');

const isProduction = process.env.NODE_ENV === 'production';

const fastify = Fastify({
  logger: isProduction ? true : {
    transport : {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        colorize: true
      }
    }
  }
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
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}
