// Base API response type
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Error types
export interface ApiError {
  detail: string;
  code?: string;
  status_code: number;
}

// Common form data
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  alternate_phone?: string;
}

// Export all common types
export type {
  Address,
  ContactInfo,
};