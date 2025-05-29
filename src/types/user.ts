export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatar?: string;
  userType: 'customer' | 'admin' | 'super_admin';
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  addresses?: UserAddress[];
  preferences?: UserPreferences;
}

export interface UserAddress {
  id: string;
  userId: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  newsletter: boolean;
  promotions: boolean;
  orderUpdates: boolean;
  language: string;
  currency: string;
} 