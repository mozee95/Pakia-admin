import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { useToastContext } from '../contexts/ToastContext';

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
  const { showError } = useToastContext();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from API services
        const [
          ordersResponse,
          recentOrdersResponse,
          lowStockResponse,
          orderStatsResponse
        ] = await Promise.allSettled([
          orderService.getOrders({ search: '', limit: 1 }), // Get total count
          orderService.getRecentOrders(3), // Get 3 recent orders
          productService.getLowStockProducts(10), // Get low stock products with threshold 10
          orderService.getOrderStats() // Get order statistics
        ]);

        // Initialize stats with defaults
        const dashboardStats: DashboardStats = {
          totalProducts: 0,
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          recentOrders: [],
          lowStockProducts: [],
        };

        // Process orders data
        if (ordersResponse.status === 'fulfilled') {
          dashboardStats.totalOrders = ordersResponse.value.pagination.total;
        }

        // Process recent orders
        if (recentOrdersResponse.status === 'fulfilled') {
          dashboardStats.recentOrders = recentOrdersResponse.value.data || [];
        }

        // Process low stock products
        if (lowStockResponse.status === 'fulfilled') {
          dashboardStats.lowStockProducts = lowStockResponse.value.data || [];
        }

        // Process order stats (revenue, etc.)
        if (orderStatsResponse.status === 'fulfilled') {
          const orderStats = orderStatsResponse.value.data;
          dashboardStats.totalRevenue = orderStats?.totalRevenue || 0;
        }

        // Try to get products count separately
        try {
          const productsResponse = await productService.getProducts({ search: '', limit: 1 });
          dashboardStats.totalProducts = productsResponse.pagination.total;
        } catch (error) {
          console.warn('Failed to fetch products count:', error);
        }

        // Try to get users count separately  
        try {
          const usersResponse = await userService.getUsers({ search: '', limit: 1 });
          if (usersResponse.pagination) {
            dashboardStats.totalUsers = usersResponse.pagination.total;
          }
        } catch (error) {
          console.warn('Failed to fetch users count:', error);
        }

        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        showError('Failed to load dashboard data', 'Please try refreshing the page');
        
        // Set empty stats on error
        setStats({
          totalProducts: 0,
          totalUsers: 0,
          totalOrders: 0,
          totalRevenue: 0,
          recentOrders: [],
          lowStockProducts: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showError]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading dashboard..." className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.user?.firstName} {order.user?.lastName}
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
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders available</p>
            )}
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
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {product.stockQuantity} units (Min: {product.minOrderQuantity})
                      </p>
                    </div>
                    <StatusBadge status="low_stock" size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No low stock alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 