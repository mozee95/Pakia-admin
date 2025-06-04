import { apiService } from './api';
import { Order, OrderStatusUpdate } from '../types/order';
import { ApiResponse, PaginatedResponse, TableFilters } from '../types/api';

export const orderService = {
  getOrders: async (filters?: TableFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Order>> => {
    try {
      // Call the backend API directly to handle response format
      const response = await apiService.get<{
        success: boolean;
        message: string;
        data: Order[];
        pagination: {
          currentPage: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/admin/orders', {
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        ...filters
      });
      
      console.log('Orders API Response:', response);
      
      // Handle the new backend response format - access nested data
      const backendResponse = response.data;
      const orders = backendResponse?.data || [];
      const pagination = backendResponse?.pagination || {
        currentPage: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };
      
      // Transform to expected PaginatedResponse format
      return {
        data: orders,
        pagination: {
          total: pagination.total,
          page: pagination.currentPage,
          limit: pagination.limit,
          totalPages: pagination.totalPages
        },
        success: true,
        message: backendResponse?.message || 'Orders loaded successfully'
      };
    } catch (error) {
      throw error;
    }
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return apiService.get<Order>(`/admin/orders/${id}`);
  },

  updateOrderStatus: async (id: string, statusData: OrderStatusUpdate): Promise<ApiResponse<Order>> => {
    return apiService.patch<Order>(`/admin/orders/${id}/status`, statusData);
  },

  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    return apiService.patch<Order>(`/admin/orders/${id}/cancel`, { reason });
  },

  processRefund: async (id: string, amount: number, reason?: string): Promise<ApiResponse<Order>> => {
    return apiService.post<Order>(`/admin/orders/${id}/refund`, { amount, reason });
  },

  getOrderStats: async (dateRange?: { from: string; to: string }): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
    revenueGrowth: number;
    orderGrowth: number;
  }>> => {
    return apiService.get('/admin/orders/stats', dateRange);
  },

  getRecentOrders: async (limit: number = 10): Promise<ApiResponse<Order[]>> => {
    return apiService.get<Order[]>('/admin/orders/recent', { limit });
  },

  bulkUpdateStatus: async (ids: string[], status: Order['status']): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/admin/orders/bulk-status', { ids, status });
  },
}; 