import { apiService } from './api';
import { ApiResponse, PaginatedResponse } from '../types/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
  publicMetadata?: {
    role?: string;
    permissions?: string[];
    assignedAt?: string;
    assignedBy?: string;
  };
}

export interface AdminAssignment {
  userId: string;
  role: 'admin' | 'super_admin' | 'manager' | 'support';
  permissions: string[];
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const adminService = {
  // Get all users with pagination and filtering
  getUsers: async (params?: UserFilters): Promise<PaginatedResponse<User>> => {
    const queryParams = {
      ...params,
      search: params?.search || '',
    };
    return apiService.getPaginated<User>('/admin/users', queryParams);
  },

  // Get only admin users
  getAdmins: async (): Promise<ApiResponse<User[]>> => {
    return apiService.get<User[]>('/admin/users/admins');
  },

  // Get single user by ID
  getUser: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.get<User>(`/admin/users/${userId}`);
  },

  // Make a user an admin
  makeUserAdmin: async (userId: string, data: Partial<AdminAssignment>): Promise<ApiResponse<User>> => {
    return apiService.post<User>(`/admin/users/${userId}/make-admin`, data);
  },

  // Remove admin role
  removeAdminRole: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.delete<User>(`/admin/users/${userId}/remove-admin`);
  },

  // Update user permissions
  updatePermissions: async (userId: string, permissions: string[]): Promise<ApiResponse<User>> => {
    return apiService.patch<User>(`/admin/users/${userId}/update-permissions`, { permissions });
  },

  // Update user role
  updateUserRole: async (userId: string, role: string): Promise<ApiResponse<User>> => {
    return apiService.patch<User>(`/admin/users/${userId}/role`, { role });
  },

  // Get activity logs for a user
  getUserActivity: async (userId: string): Promise<ApiResponse<UserActivity[]>> => {
    return apiService.get<UserActivity[]>(`/admin/users/${userId}/activity`);
  },

  // Bulk assign roles
  bulkAssignRoles: async (assignments: AdminAssignment[]): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> => {
    return apiService.post<{ successful: number; failed: number; errors: string[] }>('/admin/users/bulk-assign-roles', { assignments });
  },

  // Bulk remove admin roles
  bulkRemoveAdminRoles: async (userIds: string[]): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> => {
    return apiService.post<{ successful: number; failed: number; errors: string[] }>('/admin/users/bulk-remove-admin', { userIds });
  },

  // Get user statistics
  getUserStats: async (): Promise<ApiResponse<{
    totalUsers: number;
    totalAdmins: number;
    recentSignups: number;
    activeUsers: number;
  }>> => {
    return apiService.get('/admin/users/stats');
  },

  // Export users to CSV
  exportUsers: async (filters?: {
    search?: string;
    role?: string;
  }): Promise<Blob> => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${API_BASE_URL}/admin/users/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(apiService as any).token}`,
      },
      body: JSON.stringify(filters || {}),
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },
}; 