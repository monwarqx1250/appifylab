const { createPostSchema, getPostsSchema } = require('./posts.schemas');
const PostsService = require('./posts.service');

module.exports = async function (fastify, opts) {
  const postsService = new PostsService(fastify.prisma);

  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/posts', async (request, reply) => {
    try {
      const body = await fastify.normalizeMultipart(request)
      const post = await postsService.createPost(request.user.id, body)
      reply.code(201).send(post)
    } catch (err) {
      fastify.log.error(err)
      reply.code(500).send({ error: 'Internal Server Error' })
    }
  })

  fastify.get('/posts', { schema: getPostsSchema }, async (request, reply) => {
    try {
      const { page, limit } = request.query;
      const posts = await postsService.getFeedPosts(request.user.id, page, limit);
      reply.code(200).send(posts);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
