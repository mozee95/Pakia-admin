import { ApiResponse, PaginatedResponse } from '../types/api';
import { API_BASE_URL } from '../utils/constants';

// This will be replaced with actual Clerk token retrieval
const getAuthToken = async (): Promise<string | null> => {
  // TODO: Replace with actual authentication
  return null;
};

class ApiService {
  private baseUrl: string = API_BASE_URL;
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  async getPaginated<T>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }
    
    const response = await this.request<PaginatedResponse<T>>(url.pathname + url.search);
    return response.data as PaginatedResponse<T>;
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = await getAuthToken();
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Upload request failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 