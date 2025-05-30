import { Category, Brand } from './category';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  basePrice: number;
  unitOfMeasurement: string;
  weightKg?: number;
  dimensionsCm?: string;
  specifications?: Record<string, any>;
  technicalData?: Record<string, any>;
  isActive: boolean;
  featured: boolean;
  averageRating: number;
  totalReviews: number;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string;
  variantValue: string;
  priceAdjustment: number;
  stockQuantity: number;
  skuSuffix?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  basePrice: number;
  unitOfMeasurement: string;
  weightKg?: number;
  dimensionsCm?: string;
  specifications?: Record<string, any>;
  technicalData?: Record<string, any>;
  isActive: boolean;
  featured: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
} 