import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title = 'Dashboard' }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 