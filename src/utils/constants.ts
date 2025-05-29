export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIAL: 'partial',
} as const;

export const USER_TYPES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export const DELIVERY_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  SCHEDULED: 'scheduled',
} as const;

export const UNITS_OF_MEASUREMENT = [
  'pieces',
  'meters',
  'kilograms',
  'liters',
  'square_meters',
  'cubic_meters',
  'tons',
  'bags',
  'boxes',
  'pallets',
];

export const PAGINATION_LIMITS = {
  DEFAULT: 10,
  SMALL: 5,
  MEDIUM: 25,
  LARGE: 50,
  MAX: 100,
};

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  ready_for_delivery: 'bg-orange-100 text-orange-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  low_stock: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
  partial: 'bg-yellow-100 text-yellow-800',
}; 