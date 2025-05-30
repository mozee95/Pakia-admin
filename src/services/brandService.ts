import { apiService } from './api';
import { Brand, BrandFormData } from '../types/category';
import { ApiResponse } from '../types/api';

export const brandService = {
  // Get all brands
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    return apiService.get<Brand[]>('/admin/products/brands/all');
  },

  // Get single brand
  getBrand: async (id: string): Promise<ApiResponse<Brand>> => {
    return apiService.get<Brand>(`/admin/products/brands/${id}`);
  },

  // Create new brand
  createBrand: async (data: BrandFormData): Promise<ApiResponse<Brand>> => {
    return apiService.post<Brand>('/admin/products/brands', data);
  },

  // Update brand
  updateBrand: async (id: string, data: Partial<BrandFormData>): Promise<ApiResponse<Brand>> => {
    return apiService.patch<Brand>(`/admin/products/brands/${id}`, data);
  },

  // Delete brand
  deleteBrand: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/admin/products/brands/${id}`);
  },

  // Upload brand logo
  uploadBrandLogo: async (brandId: string, file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('brandId', brandId);
    
    return apiService.upload<string>('/admin/products/brands/logo', formData);
  },

  // Bulk operations
  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/admin/products/brands/bulk-status', { ids, isActive });
  },

  bulkDelete: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/admin/products/brands/bulk-delete', { ids });
  },

  // Get brands by country
  getBrandsByCountry: async (country: string): Promise<ApiResponse<Brand[]>> => {
    return apiService.get<Brand[]>(`/admin/products/brands/country/${country}`);
  },

  // Get brand statistics
  getBrandStats: async (id: string): Promise<ApiResponse<{
    totalProducts: number;
    activeProducts: number;
    totalRevenue: number;
    averageRating: number;
  }>> => {
    return apiService.get(`/admin/products/brands/${id}/stats`);
  },
}; 