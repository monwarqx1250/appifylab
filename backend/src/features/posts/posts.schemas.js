const createPostSchema = {
  tags: ['posts'],
  summary: 'Create a new post',
  description: 'Creates a new post with optional file attachments. Requires JWT authentication.',
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1 },
      visibility: { type: 'string', enum: ['public', 'private'] },
      file: { 
        type: 'array',
        items: { type: 'string', format: 'binary' }
      }
    }
  },
  response: {
    201: {
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
        createdAt: { type: 'string', format: 'date-time' },
        isLiked: { type: 'boolean' },
        likesCount: { type: 'integer' },
        likedBy: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
            }
          }
        },
        commentCount: { type: 'integer' },
        comments: { type: 'array', items: { type: 'object' } }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

const getPostsSchema = {
  tags: ['posts'],
  summary: 'Get feed posts',
  description: 'Returns a paginated list of posts. Only public posts and user\'s own private posts are returned.',
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
    }
  },
  response: {
    200: {
      type: 'array',
      items: {
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
          createdAt: { type: 'string', format: 'date-time' },
          _count: {
            type: 'object',
            properties: {
              comments: { type: 'integer' },
              likes: { type: 'integer' }
            }
          },
          isLiked: { type: 'boolean' },
          likesCount: { type: 'integer' },
          likedBy: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' }
              }
            }
          },
          commentCount: { type: 'integer' },
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
                likes: { type: 'integer' },
                isLiked: { type: 'boolean' },
                repliesCount: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    401: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

const getPostLikersSchema = {
  tags: ['posts'],
  summary: 'Get users who liked a post',
  description: 'Returns paginated list of users who liked a post',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Post ID' }
    }
  },
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        likers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' }
            }
          }
        },
        totalLikes: { type: 'integer' },
        hasMore: { type: 'boolean' }
      }
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' }
      }
    }
  }
};

module.exports = {
  createPostSchema,
  getPostsSchema,
  getPostLikersSchema
};
