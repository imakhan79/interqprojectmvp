import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const offerService = {
  // Get offer details by ID
  getOfferById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/offer/${id}`);
    return response.data;
  },

  // Send offer letter to candidate
  sendOffer: async (id: string, data: {
    message?: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/offer/${id}/send`, data);
    return response.data;
  },

  // Download offer letter (PDF/Word)
  downloadOffer: async (id: string, format: 'PDF' | 'Word' = 'PDF') => {
    const response = await axios.get(`${API_BASE_URL}/offer/${id}/download?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Handle candidate response (accept/decline)
  handleResponse: async (id: string, response: 'accept' | 'decline') => {
    const responseData = await axios.post(`${API_BASE_URL}/offer/${id}/response`, { response });
    return responseData.data;
  },

  // Resend offer letter
  resendOffer: async (id: string) => {
    const response = await axios.post(`${API_BASE_URL}/offer/${id}/resend`);
    return response.data;
  },

  // Get offer activity logs
  getOfferLogs: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/offer/${id}/logs`);
    return response.data;
  }
};