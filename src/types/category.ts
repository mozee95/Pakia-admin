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
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 