import { apiService } from './api';
import { Product, ProductFormData, ProductImage, ProductBackendData } from '../types/product';
import { Category, Brand } from '../types/category';
import { ApiResponse, PaginatedResponse, TableFilters } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const productService = {
  // Use admin endpoints
  getProducts: async (filters?: TableFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> => {
    // Call the backend API which returns {products: Product[], total: number}
    const response = await apiService.get<{products: Product[], total: number}>('/admin/products', {
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      ...filters
    });
    
    // Transform the response to match the expected PaginatedResponse format
    return {
      data: response.data.products,
      pagination: {
        total: response.data.total,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        totalPages: Math.ceil(response.data.total / (filters?.limit || 10))
      },
      success: true,
      message: response.message
    };
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return apiService.get<Product>(`/admin/products/${id}`);
  },

  // Create new product
  createProduct: async (data: ProductBackendData): Promise<ApiResponse<Product>> => {
    return apiService.post<Product>('/admin/products', data);
  },

  // Update existing product
  updateProduct: async (id: string, data: Partial<ProductBackendData>): Promise<ApiResponse<Product>> => {
    return apiService.patch<Product>(`/admin/products/${id}`, data);
  },

  // Delete product
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/admin/products/${id}`);
  },

  // Bulk delete products
  bulkDeleteProducts: async (ids: string[]): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/admin/products/bulk-delete', { ids });
  },

  // Bulk update product status
  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<ApiResponse<void>> => {
    return apiService.patch<void>('/admin/products/bulk-status', { ids, isActive });
  },

  // Upload product images - Updated to match new backend API
  uploadImages: async (productId: string, files: FileList): Promise<ApiResponse<ProductImage[]>> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });
    // Set first image as primary by default
    formData.append('isPrimary', 'true');
    formData.append('altText', 'Product image');
    
    return apiService.upload<ProductImage[]>(`/admin/products/${productId}/images`, formData);
  },

  // Get product images
  getImages: async (productId: string): Promise<ApiResponse<ProductImage[]>> => {
    return apiService.get<ProductImage[]>(`/admin/products/${productId}/images`);
  },

  // Delete product image - Updated endpoint
  deleteImage: async (imageId: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/admin/products/images/${imageId}`);
  },

  // Set primary image - New method
  setPrimaryImage: async (imageId: string): Promise<ApiResponse<ProductImage>> => {
    return apiService.patch<ProductImage>(`/admin/products/images/${imageId}/primary`, {});
  },

  // Get product categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return apiService.get<Category[]>('/products/categories');
  },

  // Get product brands
  getBrands: async (): Promise<ApiResponse<Brand[]>> => {
    return apiService.get<Brand[]>('/products/brands');
  },

  // Export products to CSV
  exportProducts: async (filters?: TableFilters): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/admin/products/export`, {
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

  // Import products from CSV
  importProducts: async (file: File): Promise<ApiResponse<{ successful: number; failed: number; errors: string[] }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiService.upload<{ successful: number; failed: number; errors: string[] }>('/admin/products/import', formData);
  },

  // Get low stock products
  getLowStockProducts: async (threshold: number = 10): Promise<ApiResponse<Product[]>> => {
    return apiService.get<Product[]>('/admin/products/low-stock', { threshold });
  },

  // Update product stock
  updateStock: async (id: string, quantity: number): Promise<ApiResponse<Product>> => {
    return apiService.patch<Product>(`/admin/products/${id}/stock`, { quantity });
  },
}; 