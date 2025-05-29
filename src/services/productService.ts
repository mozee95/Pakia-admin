import { apiService } from './api';
import { Product, ProductFormData } from '../types/product';
import { Category, Brand } from '../types/category';
import { ApiResponse, PaginatedResponse, TableFilters } from '../types/api';

export const productService = {
  // Get all products with filtering and pagination
  getProducts: async (filters?: TableFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> => {
    return apiService.getPaginated<Product>('/products', filters);
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return apiService.get<Product>(`/products/${id}`);
  },

  // Create new product
  createProduct: async (data: ProductFormData): Promise<ApiResponse<Product>> => {
    return apiService.post<Product>('/products', data);
  },

  // Update existing product
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<ApiResponse<Product>> => {
    return apiService.patch<Product>(`/products/${id}`, data);
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/products/${id}`);
  },

  // Bulk delete products
  bulkDeleteProducts: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/products/bulk-delete', { ids });
  },

  // Bulk update product status
  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/products/bulk-status', { ids, isActive });
  },

  // Upload product images
  uploadImages: async (productId: string, files: FileList): Promise<ApiResponse<string[]>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    formData.append('productId', productId);
    
    return apiService.upload<string[]>('/products/images', formData);
  },

  // Delete product image
  deleteImage: async (imageId: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/products/images/${imageId}`);
  },

  // Get product categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiService.get<Category[]>('/categories');
  },

  // Get product brands
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    return apiService.get<Brand[]>('/brands');
  },

  // Export products to CSV
  exportProducts: async (filters?: TableFilters): Promise<Blob> => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/products/export`, {
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

  // Import products from CSV
  importProducts: async (file: File): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiService.upload<{ successful: number; failed: number; errors: string[] }>('/products/import', formData);
  },

  // Get low stock products
  getLowStockProducts: async (threshold: number = 10): Promise<ApiResponse<Product[]>> => {
    return apiService.get<Product[]>('/products/low-stock', { threshold });
  },

  // Update product stock
  updateStock: async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
    return apiService.patch<Product>(`/products/${id}/stock`, { quantity });
  },
}; 