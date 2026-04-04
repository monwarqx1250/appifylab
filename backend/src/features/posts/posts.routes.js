const { createPostSchema, getPostsSchema } = require('./posts.schemas');
const PostsService = require('./posts.service');

module.exports = async function (fastify, opts) {
  const postsService = new PostsService(fastify.prisma);

  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/posts', {
    schema: {
      tags: ['posts'],
      summary: 'Create a new post',
      description: 'Creates a new post with optional file attachments. Requires JWT authentication.',
      consumes: ['multipart/form-data'],
      response: {
        201: {
          description: 'Post created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  content: { type: 'string' },
                  visibility: { type: 'string' },
                  author: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' }
                    }
                  },
                  attachments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        fileUrl: { type: 'string' },
                        fileType: { type: 'string' }
                      }
                    }
                  },
                  createdAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
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
