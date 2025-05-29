import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Download, Filter, RefreshCw, 
  Package, CreditCard, Truck, CheckCircle, 
  XCircle, Clock, AlertCircle, Search, Calendar
} from 'lucide-react';
import Layout from '../components/common/Layout';
import DataTable from '../components/tables/DataTable';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Order, OrderStatusUpdate } from '../types/order';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { orderService } from '../services/orderService';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
    deliveryType: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Mock data for demonstration
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      userId: 'user-1',
      status: 'confirmed',
      subtotal: 450.00,
      deliveryFee: 25.00,
      taxAmount: 47.50,
      discountAmount: 0,
      totalAmount: 522.50,
      currency: 'USD',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      deliveryAddress: {
        firstName: 'John',
        lastName: 'Doe',
        company: 'ABC Construction',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      },
      deliveryType: 'standard',
      estimatedDeliveryDate: '2024-02-01T00:00:00Z',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:00:00Z',
      user: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1-555-0123',
        userType: 'customer',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      items: [
        {
          id: 'item-1',
          orderId: '1',
          productId: 'prod-1',
          quantity: 10,
          unitPrice: 12.50,
          totalPrice: 125.00,
          product: {
            id: 'prod-1',
            name: 'Premium Cement Bags',
            slug: 'premium-cement-bags',
            sku: 'CEM-001',
            description: 'High-quality cement bags',
            shortDescription: 'Premium cement',
            categoryId: '1',
            brandId: '1',
            basePrice: 12.50,
            unitOfMeasurement: 'bags',
            stockQuantity: 150,
            minOrderQuantity: 10,
            isActive: true,
            featured: false,
            averageRating: 4.5,
            totalReviews: 25,
            specifications: {},
            technicalData: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            images: [],
            variants: []
          }
        },
        {
          id: 'item-2',
          orderId: '1',
          productId: 'prod-2',
          quantity: 5,
          unitPrice: 65.00,
          totalPrice: 325.00,
          product: {
            id: 'prod-2',
            name: 'Steel Reinforcement Bars',
            slug: 'steel-bars',
            sku: 'STL-002',
            description: 'High-strength steel bars',
            shortDescription: 'Steel bars',
            categoryId: '2',
            brandId: '2',
            basePrice: 65.00,
            unitOfMeasurement: 'pieces',
            stockQuantity: 75,
            minOrderQuantity: 5,
            isActive: true,
            featured: false,
            averageRating: 4.8,
            totalReviews: 18,
            specifications: {},
            technicalData: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            images: [],
            variants: []
          }
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      userId: 'user-2',
      status: 'processing',
      subtotal: 180.00,
      deliveryFee: 15.00,
      taxAmount: 19.50,
      discountAmount: 10.00,
      totalAmount: 204.50,
      currency: 'USD',
      paymentStatus: 'paid',
      paymentMethod: 'Bank Transfer',
      deliveryAddress: {
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Smith Builders',
        addressLine1: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90210',
        country: 'USA'
      },
      deliveryType: 'express',
      estimatedDeliveryDate: '2024-01-30T00:00:00Z',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      user: {
        id: 'user-2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1-555-0456',
        userType: 'customer',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      items: [
        {
          id: 'item-3',
          orderId: '2',
          productId: 'prod-3',
          quantity: 12,
          unitPrice: 15.00,
          totalPrice: 180.00,
          product: {
            id: 'prod-3',
            name: 'Construction Tools Set',
            slug: 'tools-set',
            sku: 'TLS-003',
            description: 'Professional construction tools',
            shortDescription: 'Tools set',
            categoryId: '3',
            brandId: '3',
            basePrice: 15.00,
            unitOfMeasurement: 'pieces',
            stockQuantity: 50,
            minOrderQuantity: 1,
            isActive: true,
            featured: true,
            averageRating: 4.7,
            totalReviews: 32,
            specifications: {},
            technicalData: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            images: [],
            variants: []
          }
        }
      ]
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      userId: 'user-3',
      status: 'delivered',
      subtotal: 320.00,
      deliveryFee: 20.00,
      taxAmount: 34.00,
      discountAmount: 0,
      totalAmount: 374.00,
      currency: 'USD',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      deliveryAddress: {
        firstName: 'Bob',
        lastName: 'Johnson',
        company: 'Johnson Construction',
        addressLine1: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA'
      },
      deliveryType: 'standard',
      actualDeliveryDate: '2024-01-12T16:30:00Z',
      createdAt: '2024-01-08T11:45:00Z',
      updatedAt: '2024-01-12T16:30:00Z',
      user: {
        id: 'user-3',
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        phoneNumber: '+1-555-0789',
        userType: 'customer',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      items: []
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.limit, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      setOrders(mockOrders);
      setPagination(prev => ({
        ...prev,
        total: mockOrders.length,
        totalPages: Math.ceil(mockOrders.length / prev.limit)
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleStatusUpdate = async (statusUpdate: OrderStatusUpdate) => {
    if (!selectedOrder) return;

    try {
      // await orderService.updateOrderStatus(selectedOrder.id, statusUpdate);
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { 
              ...order, 
              status: statusUpdate.status,
              updatedAt: new Date().toISOString(),
              estimatedDeliveryDate: statusUpdate.estimatedDeliveryDate || order.estimatedDeliveryDate
            }
          : order
      ));
      setIsStatusModalOpen(false);
      console.log('Status updated:', statusUpdate);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus;
    const matchesDeliveryType = !filters.deliveryType || order.deliveryType === filters.deliveryType;
    
    let matchesDateRange = true;
    if (filters.dateFrom) {
      matchesDateRange = matchesDateRange && new Date(order.createdAt) >= new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      matchesDateRange = matchesDateRange && new Date(order.createdAt) <= new Date(filters.dateTo + 'T23:59:59');
    }

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDeliveryType && matchesDateRange;
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Package className="h-4 w-4 text-purple-500" />;
      case 'ready_for_delivery': return <Truck className="h-4 w-4 text-orange-500" />;
      case 'in_transit': return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (value: any, order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{order.orderNumber}</p>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (value: any, order: Order) => (
        <div>
          <p className="font-medium text-gray-900">
            {order.user?.firstName} {order.user?.lastName}
          </p>
          <p className="text-sm text-gray-500">{order.user?.email}</p>
          {order.deliveryAddress.company && (
            <p className="text-sm text-gray-500">{order.deliveryAddress.company}</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, order: Order) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <StatusBadge status={order.status} size="sm" />
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (value: any, order: Order) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <StatusBadge status={order.paymentStatus} size="sm" />
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value: any, order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
          <p className="text-sm text-gray-500">{order.currency}</p>
        </div>
      )
    },
    {
      key: 'deliveryType',
      label: 'Delivery',
      render: (value: any, order: Order) => (
        <div>
          <p className="text-sm font-medium text-gray-900 capitalize">{order.deliveryType}</p>
          {order.estimatedDeliveryDate && (
            <p className="text-sm text-gray-500">
              Est: {formatDate(order.estimatedDeliveryDate)}
            </p>
          )}
          {order.actualDeliveryDate && (
            <p className="text-sm text-green-600">
              Delivered: {formatDate(order.actualDeliveryDate)}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (value: any, order: Order) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewOrder(order)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleUpdateStatus(order)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="Update Status"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Orders">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
            <p className="text-gray-600">Track and manage customer orders</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2 inline" />
              Refresh
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2 inline" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="ready_for_delivery">Ready for Delivery</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
              <select
                value={filters.deliveryType}
                onChange={(e) => setFilters({...filters, deliveryType: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Delivery Types</option>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({ status: '', paymentStatus: '', dateFrom: '', dateTo: '', deliveryType: '' })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <DataTable
          data={filteredOrders}
          columns={columns}
          loading={loading}
          onSearch={setSearchQuery}
          searchPlaceholder="Search orders, customers..."
          emptyMessage="No orders found"
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({...prev, page}))}
        />

        {/* Order Details Modal */}
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          order={selectedOrder}
        />

        {/* Order Status Update Modal */}
        <OrderStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          order={selectedOrder}
          onSubmit={handleStatusUpdate}
        />
      </div>
    </Layout>
  );
};

// Order Details Modal Component
interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order ${order.orderNumber}`} size="lg">
      <div className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDateTime(order.createdAt)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{order.user?.firstName} {order.user?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{order.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{order.user?.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
            {order.deliveryAddress.company && <p>{order.deliveryAddress.company}</p>}
            <p>{order.deliveryAddress.addressLine1}</p>
            {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}</p>
            <p>{order.deliveryAddress.country}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Product</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Unit Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.product?.sku}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Order Status Update Modal Component
interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmit: (statusUpdate: OrderStatusUpdate) => void;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit
}) => {
  const [formData, setFormData] = useState<OrderStatusUpdate>({
    status: 'pending',
    notes: '',
    estimatedDeliveryDate: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        notes: '',
        estimatedDeliveryDate: order.estimatedDeliveryDate?.split('T')[0] || '',
      });
    }
  }, [order]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Order ${order.orderNumber}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Status *</label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as Order['status']})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="ready_for_delivery">Ready for Delivery</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Date</label>
          <input
            type="date"
            value={formData.estimatedDeliveryDate}
            onChange={(e) => setFormData({...formData, estimatedDeliveryDate: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Add any notes about the status update..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Update Status
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Orders; 