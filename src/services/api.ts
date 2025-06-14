import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ApiResponse, PaginatedResponse, TableFilters } from '../types/api';
import { API_BASE_URL } from '../utils/constants';

class ApiService {
  private getTokenFunction: (() => Promise<string | null>) | null = null;

  setGetTokenFunction(getTokenFn: () => Promise<string | null>) {
    this.getTokenFunction = getTokenFn;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Get fresh token for each request
    if (this.getTokenFunction) {
      try {
        const token = await this.getTokenFunction();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get fresh token:', error);
      }
    }

    console.log('🌐 Making HTTP request:', {
      url,
      method: options.method || 'GET',
      headers: {...headers, Authorization: headers.Authorization ? '[HIDDEN]' : undefined},
      bodyPreview: options.body ? JSON.stringify(JSON.parse(options.body as string)).slice(0, 200) + '...' : undefined
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 HTTP response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      
      console.log('❌ Non-OK HTTP response:', {
        status: response.status,
        statusText: response.statusText,
        errorBody,
        errorBodyType: typeof errorBody,
        errorBodyString: JSON.stringify(errorBody, null, 2)
      });
      
      // Extract the actual error message from the backend response
      let errorMessage = 'API request failed';
      if (errorBody && typeof errorBody === 'object') {
        if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.error) {
          errorMessage = errorBody.error;
        } else if (errorBody.errors && Array.isArray(errorBody.errors)) {
          errorMessage = errorBody.errors.join(', ');
        }
      } else if (typeof errorBody === 'string') {
        errorMessage = errorBody;
      }
      
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    console.log('✅ HTTP response parsed:', {
      bodyPreview: JSON.stringify(responseBody).slice(0, 300) + '...',
      hasData: !!responseBody.data,
      success: responseBody.success,
      message: responseBody.message
    });

    return responseBody;
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<ApiResponse<T>>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    console.log('=== API PATCH DEBUGGING ===');
    console.log('Endpoint:', endpoint);
    console.log('Data being sent:', data);
    
    try {
      const response = await this.request<ApiResponse<T>>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      
      console.log('✅ PATCH response received:', {
        response,
        hasData: !!response.data,
        success: response.success,
        message: response.message
      });
      
      return response;
    } catch (error: any) {
      console.log('❌ PATCH error:', {
        errorType: typeof error,
        errorMessage: error?.message,
        errorName: error?.name,
        errorStack: error?.stack?.slice(0, 200),
        isInstanceofError: error instanceof Error
      });
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(endpoint, {
      method: 'DELETE',
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {};

    // Get fresh token for upload requests
    if (this.getTokenFunction) {
      try {
        const token = await this.getTokenFunction();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get fresh token for upload:', error);
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async getPaginated<T>(
    endpoint: string,
    filters?: TableFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<T>> {
    const params = {
      ...filters,
      page: filters?.page || 1,
      limit: filters?.limit || 10,
    };
    
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    return this.request<PaginatedResponse<T>>(`${endpoint}?${queryString}`, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();

// Hook to provide fresh token function
export const useApiAuth = () => {
  const { getToken } = useAuth();

  React.useEffect(() => {
    // Provide the getToken function to the API service
    // This ensures fresh tokens are retrieved for each request
    apiService.setGetTokenFunction(() => getToken());
  }, [getToken]);
};

export default apiService; 