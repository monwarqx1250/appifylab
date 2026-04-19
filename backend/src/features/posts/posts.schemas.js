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
  description: 'Returns a paginated list of posts with cursor-based pagination. Only public posts are returned.',
  querystring: {
    type: 'object',
    properties: {
      cursor: { type: 'string', description: 'Cursor for pagination (last post id from previous response)' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              visibility: { type: 'string' },
              authorId: { type: 'string' },
              authorFirstName: { type: 'string' },
              authorLastName: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              commentsCount: { type: 'integer' },
              hasAttachments: { type: 'boolean' },
              likesCount: { type: 'integer' },
              isLiked: { type: 'boolean' }
            }
          }
        },
        comments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              postId: { type: 'string' },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        likes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              postId: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' }
                }
              }
            }
          }
        },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string', nullable: true }
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
