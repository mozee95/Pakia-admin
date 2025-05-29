export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
}

export interface TableFilters {
  search: string;
  category?: string;
  status?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
} 