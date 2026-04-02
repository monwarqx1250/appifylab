const toggleLikeSchema = {
  body: {
    type: 'object',
    required: ['entityId', 'entityType'],
    properties: {
      entityId: { type: 'string' },
      entityType: { type: 'string', enum: ['post', 'comment'] }
    }
  }
};

module.exports = {
  toggleLikeSchema
};
