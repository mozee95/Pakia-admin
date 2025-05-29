import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  className = '',
  children 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.inactive;

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${statusColor}
        ${className}
      `}
    >
      {children || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

export default StatusBadge; 