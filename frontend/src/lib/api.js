import { TOKEN_STORAGE_KEY } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getHeaders() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...(await getHeaders()),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
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
  
  post: (endpoint, body) => 
    request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  
  put: (endpoint, body) => 
    request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export const postsApi = {
  getAll: (page = 1, limit = 10) => 
    api.get(`/posts?page=${page}&limit=${limit}`),
  
  getById: (id) => api.get(`/posts/${id}`),
  
  create: (data) => api.post('/posts', data),
  
  update: (id, data) => api.put(`/posts/${id}`, data),
  
  delete: (id) => api.delete(`/posts/${id}`),
};

export const commentsApi = {
  getByPostId: (postId) => api.get(`/comments?postId=${postId}`),
  
  create: (data) => api.post('/comments', data),
};

export const likesApi = {
  toggle: (entityId, entityType) => 
    api.post('/likes', { entityId, entityType }),
};
