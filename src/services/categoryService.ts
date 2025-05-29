import { apiService } from './api';
import { Category, Brand } from '../types/category';
import { ApiResponse } from '../types/api';

export const categoryService = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiService.get<Category[]>('/categories');
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    return apiService.get<Category>(`/categories/${id}`);
  },

  createCategory: async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Category>> => {
    return apiService.post<Category>('/categories', data);
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return apiService.patch<Category>(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/categories/${id}`);
  },

  reorderCategories: async (categoryOrders: { id: string; displayOrder: number }[]): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/categories/reorder', { categoryOrders });
  },

  uploadCategoryIcon: async (categoryId: string, file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('icon', file);
    formData.append('categoryId', categoryId);
    
    return apiService.upload<string>('/categories/icon', formData);
  },

  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    return apiService.get<Brand[]>('/brands');
  },

  createBrand: async (data: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Brand>> => {
    return apiService.post<Brand>('/brands', data);
  },

  updateBrand: async (id: string, data: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    return apiService.patch<Brand>(`/brands/${id}`, data);
  },

  deleteBrand: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/brands/${id}`);
  },
}; 