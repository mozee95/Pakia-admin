import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { ToastProvider } from '../contexts/ToastContext';
import { useApiAuth } from '../services/api';

export const AdminLayout: React.FC = () => {
  // Automatically set authentication token for API calls
  useApiAuth();

  return (
    <ToastProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ToastProvider>
  );
}; 