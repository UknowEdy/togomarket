import axios from 'axios';
import type { ApiResponse, RegisterData, LoginData, CreateListingData, ListingFilters } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configuration Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === AUTH ===
export const authAPI = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyPhone: async (code: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-phone', { code });
    return response.data;
  },

  resendCode: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/resend-code');
    return response.data;
  },

  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<RegisterData>): Promise<ApiResponse> => {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};

// === LISTINGS ===
export const listingsAPI = {
  getListings: async (filters?: ListingFilters): Promise<ApiResponse> => {
    const response = await api.get('/listings', { params: filters });
    return response.data;
  },

  getListing: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  createListing: async (data: FormData): Promise<ApiResponse> => {
    const response = await api.post('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateListing: async (id: string, data: Partial<CreateListingData>): Promise<ApiResponse> => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  deleteListing: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  markAsSold: async (id: string): Promise<ApiResponse> => {
    const response = await api.put(`/listings/${id}/mark-sold`);
    return response.data;
  },

  getMyListings: async (status?: string): Promise<ApiResponse> => {
    const response = await api.get('/listings/my/all', { params: { status } });
    return response.data;
  },

  getUserListings: async (userId: string): Promise<ApiResponse> => {
    const response = await api.get(`/listings/user/${userId}`);
    return response.data;
  }
};

// === CATEGORIES ===
export const categoriesAPI = {
  getCategories: async (): Promise<ApiResponse> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCities: async (): Promise<ApiResponse> => {
    const response = await api.get('/categories/cities');
    return response.data;
  }
};

// === MESSAGES & CONVERSATIONS ===
export const messagesAPI = {
  getOrCreateConversation: async (listingId: string): Promise<ApiResponse> => {
    const response = await api.post('/messages/conversation', { listingId });
    return response.data;
  },

  getConversations: async (): Promise<ApiResponse> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<ApiResponse> => {
    const response = await api.get(`/messages/conversation/${conversationId}`);
    return response.data;
  },

  sendMessage: async (conversationId: string, text: string, priceOffer?: any): Promise<ApiResponse> => {
    const response = await api.post('/messages/send', { conversationId, text, priceOffer });
    return response.data;
  },

  respondToOffer: async (messageId: string, action: string, counterAmount?: number): Promise<ApiResponse> => {
    const response = await api.put(`/messages/${messageId}/respond-offer`, { action, counterAmount });
    return response.data;
  },

  deleteConversation: async (conversationId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/messages/conversation/${conversationId}`);
    return response.data;
  }
};

// === FAVORITES ===
export const favoritesAPI = {
  getFavorites: async (): Promise<ApiResponse> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  checkFavorite: async (listingId: string): Promise<ApiResponse> => {
    const response = await api.get(`/favorites/check/${listingId}`);
    return response.data;
  },

  addFavorite: async (listingId: string): Promise<ApiResponse> => {
    const response = await api.post(`/favorites/${listingId}`);
    return response.data;
  },

  removeFavorite: async (listingId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/favorites/${listingId}`);
    return response.data;
  }
};

// === REVIEWS ===
export const reviewsAPI = {
  createReview: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getUserReviews: async (userId: string, page?: number): Promise<ApiResponse> => {
    const response = await api.get(`/reviews/user/${userId}`, { params: { page } });
    return response.data;
  },

  getMyReviews: async (): Promise<ApiResponse> => {
    const response = await api.get(`/reviews/by-user/${api.defaults.headers.common['Authorization']}`);
    return response.data;
  },

  updateReview: async (reviewId: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  reportReview: async (reviewId: string): Promise<ApiResponse> => {
    const response = await api.put(`/reviews/${reviewId}/report`);
    return response.data;
  }
};

export default api;
