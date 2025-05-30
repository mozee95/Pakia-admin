export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  productsCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  countryOfOrigin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form data types for creating/editing
export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface BrandFormData {
  name: string;
  description?: string;
  logoUrl?: string;
  countryOfOrigin?: string;
  isActive: boolean;
} 