import { apiService } from './api';
import { User } from '../types/user';
import { ApiResponse, PaginatedResponse, TableFilters } from '../types/api';

export const userService = {
  getUsers: async (filters?: TableFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<User>> => {
    return apiService.getPaginated<User>('/users', filters);
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/users/${id}`);
  },

  createUser: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
    return apiService.post<User>('/users', data);
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiService.patch<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/users/${id}`);
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse<User>> => {
    return apiService.patch<User>(`/users/${id}/status`, { isActive });
  },

  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/users/bulk-status', { ids, isActive });
  },

  getUserStats: async (): Promise<ApiResponse<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowth: number;
    userTypeBreakdown: Record<string, number>;
  }>> => {
    return apiService.get('/users/stats');
  },

  getRecentUsers: async (limit: number = 10): Promise<ApiResponse<User[]>> => {
    return apiService.get<User[]>('/users/recent', { limit });
  },

  exportUsers: async (filters?: TableFilters): Promise<Blob> => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth header
      },
      body: JSON.stringify(filters || {}),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },

  resetPassword: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>(`/users/${id}/reset-password`, {});
  },

  sendVerificationEmail: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>(`/users/${id}/send-verification`, {});
  },
}; 