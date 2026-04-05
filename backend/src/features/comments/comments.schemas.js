const createCommentSchema = {
  body: {
    type: 'object',
    required: ['content', 'postId'],
    properties: {
      content: { type: 'string', minLength: 1 },
      postId: { type: 'string' },
      parentId: { type: 'string', nullable: true } // For nested replies
    }
  }
};

const getCommentsSchema = {
  params: {
    type: 'object',
    required: ['postId'],
    properties: {
      postId: { type: 'string' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        comments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' }
                }
              },
              content: { type: 'string' },
              timestamp: { type: 'string' },
              likes: { type: 'number' },
              repliesCount: { type: 'number' }
            }
          }
        },
        hasMore: { type: 'boolean' },
        totalCount: { type: 'number' }
      }
    }
  }
};

module.exports = {
  createCommentSchema,
  getCommentsSchema
};
