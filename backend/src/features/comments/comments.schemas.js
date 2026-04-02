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
  }
};

module.exports = {
  createCommentSchema,
  getCommentsSchema
};
