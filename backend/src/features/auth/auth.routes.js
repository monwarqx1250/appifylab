const { registerSchema, loginSchema } = require('./auth.schemas');
const AuthService = require('./auth.service');

module.exports = async function (fastify, opts) {
  const authService = new AuthService(fastify.prisma);
  fastify.post('/auth/register', { schema: registerSchema }, async (request, reply) => {
    try {
      const user = await authService.registerUser(request.body);
      const token = fastify.jwt.sign({ id: user.id, email: user.email });
      reply.code(201).send({ token, user });
    } catch (err) {
      if (err.message === 'Email already exists') {
        reply.code(409).send({ error: err.message });
      } else {
        reply.code(500).send({ error: 'Internal Server Error' });
      }
    }
  });

  fastify.post('/auth/login', { schema: loginSchema }, async (request, reply) => {
    try {
      const { email, password } = request.body;
      const user = await authService.loginUser(email, password);
      const token = fastify.jwt.sign({ id: user.id, email: user.email });
      reply.code(200).send({ token, user });
    } catch (err) {
      if (err.message === 'Invalid email or password') {
        reply.code(401).send({ error: err.message });
      } else {
        reply.code(500).send({ error: 'Internal Server Error' });
      }
    }
  });

  fastify.get('/auth/me', async (request, reply) => {
    try {
      const user = await authService.getUserById(request.user.id);
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      reply.code(200).send(user);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
