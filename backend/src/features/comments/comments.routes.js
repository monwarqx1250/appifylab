const { createCommentSchema, getCommentsSchema, getRepliesSchema } = require('./comments.schemas');
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

  // Get initial comments (paginated - for embedding in posts)
  fastify.get('/posts/:postId/comments', { schema: getCommentsSchema }, async (request, reply) => {
    try {
      const { postId } = request.params;
      const { page = 1, limit = 3 } = request.query;
      const result = await commentsService.getCommentsByPostId(postId, request.user.id, page, limit, false);
      reply.code(200).send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // Get all comments for modal
  fastify.get('/posts/:postId/all-comments', async (request, reply) => {
    try {
      const { postId } = request.params;
      const comments = await commentsService.getAllComments(postId);
      reply.code(200).send(comments);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // Get replies for a specific comment
  fastify.get('/comments/:commentId/replies', { schema: getRepliesSchema }, async (request, reply) => {
    try {
      const { commentId } = request.params;
      const { page = 1, limit = 10 } = request.query;
      const result = await commentsService.getReplies(commentId, request.user.id, page, limit);
      reply.code(200).send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
