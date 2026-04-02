const fp = require('fastify-plugin');

module.exports = fp(async function (fastify) {
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'AppifyLab API',
        description: 'API documentation',
        version: process.env.npm_package_version || '1.0.0',
      },
    },
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
});

