import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatPercentage } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className = '',
  loading = false,
}) => {
  const formattedValue = typeof value === 'number' ? formatNumber(value) : value;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-4 h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <Icon className="h-8 w-8 text-primary-600" />
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{formattedValue}</p>
        
        {trend && (
          <div className="mt-2 flex items-center">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span 
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercentage(Math.abs(trend.value))}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 