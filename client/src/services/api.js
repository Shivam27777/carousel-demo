import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API functions for image operations
export const imageService = {
  // Get all images
  getAll: async () => {
    try {
      const response = await api.get('/images');
      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  },

  // Add a new image
  add: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  },

  // Update an image
  update: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/images/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  },

  // Delete an image
  delete: async (id) => {
    try {
      const response = await api.delete(`/images/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Update sequence of images
  updateSequence: async (sequenceUpdates) => {
    try {
      const response = await api.put('/images/sequence', { sequenceUpdates });
      return response.data;
    } catch (error) {
      console.error('Error updating sequence:', error);
      throw error;
    }
  }
};

export default api;