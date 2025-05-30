import { apiService } from './api';
import { Category, Brand, CategoryFormData, BrandFormData } from '../types/category';
import { ApiResponse } from '../types/api';

export const categoryService = {
  // Category management
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiService.get<Category[]>('/admin/products/categories/all');
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    return apiService.get<Category>(`/admin/products/categories/${id}`);
  },

  createCategory: async (data: CategoryFormData): Promise<ApiResponse<Category>> => {
    return apiService.post<Category>('/admin/products/categories', data);
  },

  updateCategory: async (id: string, data: Partial<CategoryFormData>): Promise<ApiResponse<Category>> => {
    return apiService.patch<Category>(`/admin/products/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/admin/products/categories/${id}`);
  },

  reorderCategories: async (categoryOrders: { id: string; displayOrder: number }[]): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/admin/products/categories/reorder', { categoryOrders });
  },

  uploadCategoryIcon: async (categoryId: string, file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('icon', file);
    formData.append('categoryId', categoryId);
    
    return apiService.upload<string>('/admin/products/categories/icon', formData);
  },

  // Brand management
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    return apiService.get<Brand[]>('/admin/products/brands/all');
  },

  getBrand: async (id: string): Promise<ApiResponse<Brand>> => {
    return apiService.get<Brand>(`/admin/products/brands/${id}`);
  },

  createBrand: async (data: BrandFormData): Promise<ApiResponse<Brand>> => {
    return apiService.post<Brand>('/admin/products/brands', data);
  },

  updateBrand: async (id: string, data: Partial<BrandFormData>): Promise<ApiResponse<Brand>> => {
    return apiService.patch<Brand>(`/admin/products/brands/${id}`, data);
  },

  deleteBrand: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/admin/products/brands/${id}`);
  },

  uploadBrandLogo: async (brandId: string, file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('brandId', brandId);
    
    return apiService.upload<string>('/admin/products/brands/logo', formData);
  },

  // Bulk operations
  bulkUpdateCategoryStatus: async (ids: string[], isActive: boolean): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/admin/products/categories/bulk-status', { ids, isActive });
  },

  bulkUpdateBrandStatus: async (ids: string[], isActive: boolean): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/admin/products/brands/bulk-status', { ids, isActive });
  },

  bulkDeleteCategories: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/admin/products/categories/bulk-delete', { ids });
  },

  bulkDeleteBrands: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/admin/products/brands/bulk-delete', { ids });
  },
}; 