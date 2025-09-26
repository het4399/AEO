import axios, { AxiosResponse, AxiosError } from 'axios';
import { AnalysisResult, AnalysisError } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async analyzeUrl(url: string): Promise<AnalysisResult> {
    try {
      console.log(`Making API call to: ${this.baseURL}/analyze`);
      console.log(`Analyzing URL: ${url}`);
      
      const response: AxiosResponse<AnalysisResult> = await axios.post(
        `${this.baseURL}/analyze`,
        { url: url.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Analysis failed - no success flag in response');
      }
    } catch (error: any) {
      console.error('API Error:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData && errorData.error) {
          throw new Error(errorData.error);
        }
        throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check if the backend is running on port 5000.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Failed to analyze URL');
      }
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      console.log(`Making health check to: ${this.baseURL}/health`);
      
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000, // 5 second timeout for health check
      });
      
      console.log('Health check response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Health check error:', error);
      throw new Error('Health check failed - backend may not be running');
    }
  }
}

export const apiService = new ApiService();
export default apiService;
