import { apiService } from './api';
import { Order, OrderStatusUpdate } from '../types/order';
import { ApiResponse, PaginatedResponse, TableFilters } from '../types/api';

export const orderService = {
  getOrders: async (filters?: TableFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Order>> => {
    return apiService.getPaginated<Order>('/orders', filters);
  },

  getOrder: async (id: string): Promise<ApiResponse<Order>> => {
    return apiService.get<Order>(`/orders/${id}`);
  },

  updateOrderStatus: async (id: string, statusData: OrderStatusUpdate): Promise<ApiResponse<Order>> => {
    return apiService.patch<Order>(`/orders/${id}/status`, statusData);
  },

  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    return apiService.patch<Order>(`/orders/${id}/cancel`, { reason });
  },

  processRefund: async (id: string, amount: number, reason?: string): Promise<ApiResponse<Order>> => {
    return apiService.post<Order>(`/orders/${id}/refund`, { amount, reason });
  },

  getOrderStats: async (dateRange?: { from: string; to: string }): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
    revenueGrowth: number;
    orderGrowth: number;
  }>> => {
    return apiService.get('/orders/stats', dateRange);
  },

  getRecentOrders: async (limit: number = 10): Promise<ApiResponse<Order[]>> => {
    return apiService.get<Order[]>('/orders/recent', { limit });
  },

  bulkUpdateStatus: async (ids: string[], status: Order['status']): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/orders/bulk-status', { ids, status });
  },
}; 