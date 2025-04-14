import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return api.post('/api/auth/logout');
  },
};

export const notes = {
  getAll: () => api.get('/api/notes'),
  getById: (id) => api.get(`/api/notes/${id}`),
  create: (noteData) => api.post('/api/notes', noteData),
  update: (id, noteData) => api.put(`/api/notes/${id}`, noteData),
  delete: (id) => api.delete(`/api/notes/${id}`),
  share: (id, shareData) => api.post(`/api/notes/${id}/share`, shareData),
};

export const upload = {
  uploadImage: (formData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api; 