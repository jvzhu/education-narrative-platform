import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Story APIs
export const storyAPI = {
  getAllStories: (page = 1, limit = 10, category = '') =>
    api.get('/stories', { params: { page, limit, category } }),
  getStoryById: (id) => api.get(`/stories/${id}`),
  getUserStories: (userId, page = 1, limit = 10) =>
    api.get(`/stories/user/${userId}`, { params: { page, limit } }),
  createStory: (data) => api.post('/stories', data),
  updateStory: (id, data) => api.put(`/stories/${id}`, data),
  deleteStory: (id) => api.delete(`/stories/${id}`),
  likeStory: (id) => api.post(`/stories/${id}/like`),
  bookmarkStory: (id) => api.post(`/stories/${id}/bookmark`),
  getUserBookmarks: (userId) => {
    if (!userId) {
      return Promise.reject(new Error('userId is required'));
    }
    return api.get(`/stories/user/${userId}/bookmarks`);
  },
};

// Comment APIs
export const commentAPI = {
  addComment: (storyId, content) => api.post(`/comments/story/${storyId}`, { content }),
  getComments: (storyId) => api.get(`/comments/story/${storyId}`),
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
};

export default api;
