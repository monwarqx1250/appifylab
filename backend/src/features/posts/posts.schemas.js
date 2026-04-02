const createPostSchema = {
  body: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1 },
      visibility: { type: 'string', enum: ['public', 'private'] }
    }
  }
};

const getPostsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
    }
  }
};

module.exports = {
  createPostSchema,
  getPostsSchema
};
