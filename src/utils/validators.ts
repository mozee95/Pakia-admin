import * as yup from 'yup';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidSku = (sku: string): boolean => {
  const skuRegex = /^[A-Z0-9\-]{3,20}$/;
  return skuRegex.test(sku.toUpperCase());
};

// Yup validation schemas
export const productSchema = yup.object({
  name: yup.string().required('Product name is required').min(2, 'Name must be at least 2 characters'),
  slug: yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  shortDescription: yup.string().required('Short description is required').max(200, 'Short description must be less than 200 characters'),
  sku: yup.string().required('SKU is required').test('valid-sku', 'Invalid SKU format', isValidSku),
  categoryId: yup.string().required('Category is required'),
  brandId: yup.string().required('Brand is required'),
  basePrice: yup.number().required('Price is required').min(0, 'Price must be positive'),
  unitOfMeasurement: yup.string().required('Unit of measurement is required'),
  weightKg: yup.number().min(0, 'Weight must be positive').nullable(),
  stockQuantity: yup.number().required('Stock quantity is required').min(0, 'Stock must be positive'),
  minOrderQuantity: yup.number().required('Minimum order quantity is required').min(1, 'Minimum order must be at least 1'),
  maxOrderQuantity: yup.number().min(1, 'Maximum order must be at least 1').nullable(),
  isActive: yup.boolean().required(),
  featured: yup.boolean().required(),
});

export const categorySchema = yup.object({
  name: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters'),
  slug: yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: yup.string().nullable(),
  parentId: yup.string().nullable(),
  displayOrder: yup.number().required('Display order is required').min(0, 'Display order must be positive'),
  isActive: yup.boolean().required(),
});

export const userSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email format'),
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  phoneNumber: yup.string().nullable().test('valid-phone', 'Invalid phone number format', (value) => {
    if (!value) return true;
    return isValidPhone(value);
  }),
  userType: yup.string().required('User type is required').oneOf(['customer', 'admin', 'super_admin']),
  isActive: yup.boolean().required(),
});

export const orderStatusSchema = yup.object({
  status: yup.string().required('Status is required').oneOf(['pending', 'confirmed', 'processing', 'ready_for_delivery', 'in_transit', 'delivered', 'cancelled']),
  notes: yup.string().nullable(),
  estimatedDeliveryDate: yup.date().nullable(),
}); 