import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { userService } from '../services/userService';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API calls - replace with actual service calls
        const mockStats: DashboardStats = {
          totalProducts: 1250,
          totalUsers: 3420,
          totalOrders: 892,
          totalRevenue: 125000,
          recentOrders: [
            {
              id: '1',
              orderNumber: 'ORD-001',
              user: { firstName: 'John', lastName: 'Doe' },
              totalAmount: 299.99,
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
            {
              id: '2',
              orderNumber: 'ORD-002',
              user: { firstName: 'Jane', lastName: 'Smith' },
              totalAmount: 149.50,
              status: 'confirmed',
              createdAt: new Date().toISOString(),
            },
            {
              id: '3',
              orderNumber: 'ORD-003',
              user: { firstName: 'Bob', lastName: 'Johnson' },
              totalAmount: 75.25,
              status: 'delivered',
              createdAt: new Date().toISOString(),
            },
          ],
          lowStockProducts: [
            {
              id: '1',
              name: 'Premium Cement Bags',
              stockQuantity: 5,
              minOrderQuantity: 10,
            },
            {
              id: '2',
              name: 'Steel Reinforcement Bars',
              stockQuantity: 3,
              minOrderQuantity: 20,
            },
          ],
        };

        setStats(mockStats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <LoadingSpinner size="lg" text="Loading dashboard..." className="h-64" />
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Package}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            trend={{ value: 15.3, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            trend={{ value: 23.1, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats?.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {product.stockQuantity} units
                      </p>
                    </div>
                    <StatusBadge status="low_stock" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 