import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Package2, 
  Building2,
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings,
  LucideIcon 
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/admin' },
  { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
  { id: 'categories', label: 'Categories', icon: Package2, path: '/admin/categories' },
  { id: 'brands', label: 'Brands', icon: Building2, path: '/admin/brands' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },

];

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {isCollapsed ? (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Pakia Admin</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 