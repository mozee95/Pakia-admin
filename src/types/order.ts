import { User } from './user';
import { Product } from './product';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready_for_delivery' | 'in_transit' | 'delivered' | 'cancelled';
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
  paymentMethod?: string;
  deliveryAddress: Record<string, any>;
  deliveryInstructions?: string;
  deliveryType: 'standard' | 'express' | 'scheduled';
  scheduledDeliveryDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: Record<string, any>;
  product?: Product;
}

export interface OrderStatusUpdate {
  status: Order['status'];
  notes?: string;
  estimatedDeliveryDate?: string;
} 