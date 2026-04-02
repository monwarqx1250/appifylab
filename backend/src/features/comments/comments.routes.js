const { createCommentSchema, getCommentsSchema } = require('./comments.schemas');
const CommentsService = require('./comments.service');

module.exports = async function (fastify, opts) {
  const commentsService = new CommentsService(fastify.prisma);

  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/comments', { schema: createCommentSchema }, async (request, reply) => {
    try {
      const comment = await commentsService.createComment(request.user.id, request.body);
      reply.code(201).send(comment);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/posts/:postId/comments', { schema: getCommentsSchema }, async (request, reply) => {
    try {
      const { postId } = request.params;
      const comments = await commentsService.getCommentsByPostId(postId);
      reply.code(200).send(comments);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
