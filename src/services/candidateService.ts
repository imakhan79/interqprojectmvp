import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const candidateService = {
  // Get candidate details by ID
  getCandidateById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/candidate/${id}`);
    return response.data;
  },

  // Send email to candidate
  sendEmail: async (data: {
    to: string;
    subject: string;
    message: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/candidate/send-email`, data);
    return response.data;
  },

  // Schedule interview for candidate
  scheduleInterview: async (data: {
    candidateId: string;
    date: string;
    time: string;
    type: 'Zoom' | 'Google Meet' | 'Onsite';
  }) => {
    const response = await axios.post(`${API_BASE_URL}/candidate/schedule-interview`, data);
    return response.data;
  },

  // Update candidate stage
  updateStage: async (id: string, stage: string) => {
    const response = await axios.put(`${API_BASE_URL}/candidate/${id}/stage`, { stage });
    return response.data;
  },

  // Reject candidate
  rejectCandidate: async (id: string) => {
    const response = await axios.put(`${API_BASE_URL}/candidate/${id}/reject`);
    return response.data;
  }
};