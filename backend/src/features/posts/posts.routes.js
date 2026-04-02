const { createPostSchema, getPostsSchema } = require('./posts.schemas');
const PostsService = require('./posts.service');

module.exports = async function (fastify, opts) {
  const postsService = new PostsService(fastify.prisma);

  // Add the onRequest hook for all routes in this plugin
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/posts', { schema: createPostSchema }, async (request, reply) => {
    try {
      const post = await postsService.createPost(request.user.id, request.body);
      reply.code(201).send(post);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

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
