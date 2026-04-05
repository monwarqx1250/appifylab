const { toggleLikeSchema } = require('./likes.schemas');
const LikesService = require('./likes.service');

module.exports = async function (fastify, opts) {
  const likesService = new LikesService(fastify.prisma);

  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/likes/toggle', { schema: toggleLikeSchema }, async (request, reply) => {
    try {
      const { entityId, entityType } = request.body;
      const result = await likesService.toggleLike(request.user.id, entityId, entityType);
      reply.code(200).send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/comments/:commentId/likers', async (request, reply) => {
    try {
      const { commentId } = request.params;
      const page = parseInt(request.query.page) || 1;
      const limit = parseInt(request.query.limit) || 20;
      const result = await likesService.getCommentLikers(commentId, page, limit);
      if (!result) {
        reply.code(404).send({ error: 'Comment not found' });
        return;
      }
      reply.code(200).send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
