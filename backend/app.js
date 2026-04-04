const path = require('path');
const AutoLoad = require('@fastify/autoload');
const cors = require('@fastify/cors');
const { default: fastify } = require('fastify');
const fastifyStatic = require('@fastify/static');


module.exports = async function (fastify, opts) {
  await fastify.register(cors, {
    origin: '*',
  });

  fastify.register(require('@fastify/multipart'))

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'uploads'),
    prefix: '/uploads/',
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'src', 'plugins'),
    options: Object.assign({}, opts),
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'src', 'features'),
    dirNameRoutePrefix: false,
    options: Object.assign({ prefix: '/api' }, opts),
    matchFilter: (path) => path.endsWith('.routes.js')
  });
};
