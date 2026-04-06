import { TOKEN_STORAGE_KEY, persistAuthSession } from './auth';
export { TOKEN_STORAGE_KEY, persistAuthSession } from './auth';
export { postAuth } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getHeaders(options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return {
    ...(options.method !== 'DELETE' && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...(await getHeaders(options)),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const text = await response.text();
    
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response text:', text);
      return {
        ok: false,
        status: response.status,
        data: { error: 'Invalid JSON response' },
      };
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      ok: false,
      status: 500,
      data: { error: 'Network error' },
    };
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  
  post: (endpoint, b) => 
    request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(b) 
    }),
  
  put: (endpoint, b) => 
    request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(b) 
    }),
  
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export const postsApi = {
  getAll: (page = 1, limit = 10) => 
    api.get(`/posts?page=${page}&limit=${limit}`),
  
  getById: (id) => api.get(`/posts/${id}`),
  
  create: (data) => api.post('/posts', data),
  
  createWithFiles: async (formData) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const url = `${API_BASE_URL}/posts`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error('API request error:', error);
      return { ok: false, status: 500, data: { error: 'Network error' } };
    }
  },
  
  update: (id, data) => api.put(`/posts/${id}`, data),
  
  delete: (id) => api.delete(`/posts/${id}`),
};

export const commentsApi = {
  getByPostId: (postId, page = 1, limit = 3) => 
    api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`),
  
  getAllByPostId: (postId) => 
    api.get(`/posts/${postId}/all-comments`),
  
  getReplies: (commentId, page = 1, limit = 10) => 
    api.get(`/comments/${commentId}/replies?page=${page}&limit=${limit}`),
  
  create: (data) => api.post('/comments', data),

  replyToComment: (postId, content, parentId) => 
    api.post('/comments', { postId, content, parentId }),
};

export const likesApi = {
  toggle: (entityId, entityType) => 
    api.post('/likes/toggle', { entityId, entityType }),
  
  getPostLikers: (postId, page = 1, limit = 20) => 
    api.get(`/posts/${postId}/likers?page=${page}&limit=${limit}`),

  getCommentLikers: (commentId, page = 1, limit = 20) => 
    api.get(`/comments/${commentId}/likers?page=${page}&limit=${limit}`),
};
