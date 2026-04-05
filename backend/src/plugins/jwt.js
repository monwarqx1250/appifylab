const fp = require('fastify-plugin');
const jwt = require('@fastify/jwt');

module.exports = fp(async function (fastify, opts) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'super_secret_buddy_script_key_123',
  });

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
